// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedDiscord
 * @dev Main contract for managing channels, messages, and payments
 */
contract DecentralizedDiscord is Ownable, ReentrancyGuard {

    struct Channel {
        uint256 id;
        string name;
        address creator;
        uint256 createdAt;
        bool isPrivate;
        uint256 accessPrice; // Price in wei to access channel (0 for public)
        bool exists;
    }

    struct Message {
        uint256 id;
        uint256 channelId;
        address sender;
        string content;
        uint256 timestamp;
        uint256 tipAmount;
    }

    // State variables
    uint256 private channelCounter;
    uint256 private messageCounter;

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => Message[]) public channelMessages;
    mapping(uint256 => mapping(address => bool)) public channelAccess;
    mapping(address => uint256) public userBalances;

    // Events
    event ChannelCreated(uint256 indexed channelId, string name, address indexed creator, bool isPrivate, uint256 accessPrice);
    event MessageSent(uint256 indexed messageId, uint256 indexed channelId, address indexed sender, string content, uint256 timestamp);
    event ChannelAccessGranted(uint256 indexed channelId, address indexed user);
    event TipSent(uint256 indexed messageId, address indexed from, address indexed to, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {
        channelCounter = 0;
        messageCounter = 0;
    }

    /**
     * @dev Create a new channel
     * @param _name Channel name
     * @param _isPrivate Whether the channel is private
     * @param _accessPrice Price to access channel (0 for public/free)
     */
    function createChannel(string memory _name, bool _isPrivate, uint256 _accessPrice) external returns (uint256) {
        require(bytes(_name).length > 0, "Channel name cannot be empty");

        if (!_isPrivate) {
            require(_accessPrice == 0, "Public channels must be free");
        }

        channelCounter++;
        uint256 channelId = channelCounter;

        channels[channelId] = Channel({
            id: channelId,
            name: _name,
            creator: msg.sender,
            createdAt: block.timestamp,
            isPrivate: _isPrivate,
            accessPrice: _accessPrice,
            exists: true
        });

        // Creator has automatic access
        channelAccess[channelId][msg.sender] = true;

        emit ChannelCreated(channelId, _name, msg.sender, _isPrivate, _accessPrice);

        return channelId;
    }

    /**
     * @dev Join a channel (pay access price if required)
     * @param _channelId ID of the channel to join
     */
    function joinChannel(uint256 _channelId) external payable {
        Channel memory channel = channels[_channelId];
        require(channel.exists, "Channel does not exist");
        require(!channelAccess[_channelId][msg.sender], "Already have access to channel");

        if (channel.isPrivate && channel.accessPrice > 0) {
            require(msg.value >= channel.accessPrice, "Insufficient payment for channel access");

            // Credit the channel creator
            userBalances[channel.creator] += msg.value;
        } else {
            require(msg.value == 0, "No payment required for this channel");
        }

        channelAccess[_channelId][msg.sender] = true;

        emit ChannelAccessGranted(_channelId, msg.sender);
    }

    /**
     * @dev Send a message to a channel
     * @param _channelId Channel ID
     * @param _content Message content
     */
    function sendMessage(uint256 _channelId, string memory _content) external {
        Channel memory channel = channels[_channelId];
        require(channel.exists, "Channel does not exist");
        require(channelAccess[_channelId][msg.sender], "No access to this channel");
        require(bytes(_content).length > 0, "Message cannot be empty");

        messageCounter++;

        Message memory newMessage = Message({
            id: messageCounter,
            channelId: _channelId,
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            tipAmount: 0
        });

        channelMessages[_channelId].push(newMessage);

        emit MessageSent(messageCounter, _channelId, msg.sender, _content, block.timestamp);
    }

    /**
     * @dev Tip a message sender
     * @param _channelId Channel ID
     * @param _messageIndex Index of message in channel
     */
    function tipMessage(uint256 _channelId, uint256 _messageIndex) external payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(channels[_channelId].exists, "Channel does not exist");
        require(_messageIndex < channelMessages[_channelId].length, "Message does not exist");

        Message storage message = channelMessages[_channelId][_messageIndex];
        require(message.sender != msg.sender, "Cannot tip your own message");

        message.tipAmount += msg.value;
        userBalances[message.sender] += msg.value;

        emit TipSent(message.id, msg.sender, message.sender, msg.value);
    }

    /**
     * @dev Withdraw accumulated balance
     */
    function withdraw() external nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        userBalances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, balance);
    }

    /**
     * @dev Get all messages in a channel
     * @param _channelId Channel ID
     */
    function getChannelMessages(uint256 _channelId) external view returns (Message[] memory) {
        require(channels[_channelId].exists, "Channel does not exist");
        require(channelAccess[_channelId][msg.sender], "No access to this channel");

        return channelMessages[_channelId];
    }

    /**
     * @dev Get channel details
     * @param _channelId Channel ID
     */
    function getChannel(uint256 _channelId) external view returns (Channel memory) {
        require(channels[_channelId].exists, "Channel does not exist");
        return channels[_channelId];
    }

    /**
     * @dev Check if user has access to channel
     * @param _channelId Channel ID
     * @param _user User address
     */
    function hasChannelAccess(uint256 _channelId, address _user) external view returns (bool) {
        return channelAccess[_channelId][_user];
    }

    /**
     * @dev Get total number of channels
     */
    function getChannelCount() external view returns (uint256) {
        return channelCounter;
    }

    /**
     * @dev Get user's balance
     * @param _user User address
     */
    function getUserBalance(address _user) external view returns (uint256) {
        return userBalances[_user];
    }
}
