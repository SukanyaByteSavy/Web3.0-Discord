// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DiscordNFT
 * @dev NFT contract for premium access and special roles in channels
 */
contract DiscordNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public mintPrice;
    string private _baseTokenURI;

    enum MembershipTier {
        BASIC,
        PREMIUM,
        VIP
    }

    struct NFTMetadata {
        MembershipTier tier;
        uint256 mintedAt;
        string username;
    }

    mapping(uint256 => NFTMetadata) public tokenMetadata;
    mapping(address => bool) public hasMinted;
    mapping(MembershipTier => uint256) public tierPrices;

    event NFTMinted(address indexed to, uint256 indexed tokenId, MembershipTier tier);
    event MintPriceUpdated(uint256 newPrice);
    event TierPriceUpdated(MembershipTier tier, uint256 price);

    constructor(uint256 _mintPrice) ERC721("Discord Membership NFT", "DNFT") Ownable(msg.sender) {
        mintPrice = _mintPrice;
        _tokenIdCounter = 1;

        // Set initial tier prices
        tierPrices[MembershipTier.BASIC] = 0.01 ether;
        tierPrices[MembershipTier.PREMIUM] = 0.05 ether;
        tierPrices[MembershipTier.VIP] = 0.1 ether;
    }

    /**
     * @dev Mint a new membership NFT
     * @param _tier Membership tier
     * @param _username Username for the NFT
     */
    function mint(MembershipTier _tier, string memory _username) external payable {
        require(!hasMinted[msg.sender], "Already minted a membership NFT");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(msg.value >= tierPrices[_tier], "Insufficient payment for this tier");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);

        tokenMetadata[tokenId] = NFTMetadata({
            tier: _tier,
            mintedAt: block.timestamp,
            username: _username
        });

        hasMinted[msg.sender] = true;

        emit NFTMinted(msg.sender, tokenId, _tier);
    }

    /**
     * @dev Get NFT metadata for a token
     * @param tokenId Token ID
     */
    function getTokenMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMetadata[tokenId];
    }

    /**
     * @dev Check if address has premium access (PREMIUM or VIP tier)
     * @param _user User address
     */
    function hasPremiumAccess(address _user) external view returns (bool) {
        uint256 balance = balanceOf(_user);
        if (balance == 0) return false;

        // Check all tokens owned by user
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == _user) {
                MembershipTier tier = tokenMetadata[i].tier;
                if (tier == MembershipTier.PREMIUM || tier == MembershipTier.VIP) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @dev Check if address has VIP access
     * @param _user User address
     */
    function hasVIPAccess(address _user) external view returns (bool) {
        uint256 balance = balanceOf(_user);
        if (balance == 0) return false;

        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == _user) {
                if (tokenMetadata[i].tier == MembershipTier.VIP) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @dev Get user's membership tier
     * @param _user User address
     */
    function getUserTier(address _user) external view returns (MembershipTier) {
        uint256 balance = balanceOf(_user);
        require(balance > 0, "User does not own a membership NFT");

        MembershipTier highestTier = MembershipTier.BASIC;

        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == _user) {
                MembershipTier tier = tokenMetadata[i].tier;
                if (uint(tier) > uint(highestTier)) {
                    highestTier = tier;
                }
            }
        }

        return highestTier;
    }

    /**
     * @dev Update tier prices (owner only)
     * @param _tier Tier to update
     * @param _price New price
     */
    function setTierPrice(MembershipTier _tier, uint256 _price) external onlyOwner {
        tierPrices[_tier] = _price;
        emit TierPriceUpdated(_tier, _price);
    }

    /**
     * @dev Set base URI for token metadata
     * @param baseURI Base URI string
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        NFTMetadata memory metadata = tokenMetadata[tokenId];
        string memory tierName;

        if (metadata.tier == MembershipTier.BASIC) {
            tierName = "Basic";
        } else if (metadata.tier == MembershipTier.PREMIUM) {
            tierName = "Premium";
        } else {
            tierName = "VIP";
        }

        // Return simple JSON metadata
        return string(abi.encodePacked(
            '{"name": "Discord Membership #', tokenId.toString(),
            '", "description": "Membership NFT for Decentralized Discord",',
            '"tier": "', tierName,
            '", "username": "', metadata.username, '"}'
        ));
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
