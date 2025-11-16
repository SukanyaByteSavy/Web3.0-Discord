import React, { useState, useEffect } from 'react';
import './App.css';
import { useWeb3 } from './Web3Context';
import { ethers } from 'ethers';

function App() {
  const { account, discordContract, nftContract, connectWallet, isConnecting, error, isConnected } = useWeb3();

  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Channel creation form
  const [channelName, setChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessPrice, setAccessPrice] = useState('0');

  useEffect(() => {
    if (discordContract && account) {
      loadChannels();
      loadUserBalance();
    }
  }, [discordContract, account]);

  useEffect(() => {
    if (currentChannel && discordContract) {
      loadMessages();
    }
  }, [currentChannel, discordContract]);

  const loadChannels = async () => {
    try {
      const count = await discordContract.getChannelCount();
      const loadedChannels = [];

      for (let i = 1; i <= Number(count); i++) {
        try {
          const channel = await discordContract.getChannel(i);
          const hasAccess = await discordContract.hasChannelAccess(i, account);

          loadedChannels.push({
            id: Number(channel.id),
            name: channel.name,
            creator: channel.creator,
            isPrivate: channel.isPrivate,
            accessPrice: channel.accessPrice,
            hasAccess
          });
        } catch (err) {
          console.log(`Could not load channel ${i}`);
        }
      }

      setChannels(loadedChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentChannel) return;

    try {
      const channelMessages = await discordContract.getChannelMessages(currentChannel.id);
      const formattedMessages = channelMessages.map(msg => ({
        id: Number(msg.id),
        channelId: Number(msg.channelId),
        sender: msg.sender,
        content: msg.content,
        timestamp: Number(msg.timestamp),
        tipAmount: msg.tipAmount
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const loadUserBalance = async () => {
    try {
      const balance = await discordContract.getUserBalance(account);
      setUserBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const createChannel = async () => {
    if (!channelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    try {
      setLoading(true);
      const priceInWei = isPrivate ? ethers.parseEther(accessPrice || '0') : 0;
      const tx = await discordContract.createChannel(channelName, isPrivate, priceInWei);
      await tx.wait();

      setChannelName('');
      setIsPrivate(false);
      setAccessPrice('0');
      setShowCreateChannelModal(false);
      await loadChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinChannel = async (channel) => {
    try {
      setLoading(true);
      const value = channel.isPrivate && channel.accessPrice > 0 ? channel.accessPrice : 0;
      const tx = await discordContract.joinChannel(channel.id, { value });
      await tx.wait();
      await loadChannels();
      alert('Successfully joined channel!');
    } catch (error) {
      console.error('Error joining channel:', error);
      alert('Failed to join channel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel) return;

    try {
      setLoading(true);
      const tx = await discordContract.sendMessage(currentChannel.id, newMessage);
      await tx.wait();
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tipMessage = async (messageIndex) => {
    const tipAmount = prompt('Enter tip amount in ETH:');
    if (!tipAmount) return;

    try {
      setLoading(true);
      const value = ethers.parseEther(tipAmount);
      const tx = await discordContract.tipMessage(currentChannel.id, messageIndex, { value });
      await tx.wait();
      await loadMessages();
      await loadUserBalance();
      alert('Tip sent successfully!');
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    try {
      setLoading(true);
      const tx = await discordContract.withdraw();
      await tx.wait();
      await loadUserBalance();
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="header">
          <h1>Decentralized Discord</h1>
        </div>
        <div className="connect-screen">
          <div className="connect-card">
            <h2>Welcome to Decentralized Discord</h2>
            <p>
              A blockchain-powered messaging platform with NFT-based access control,
              on-chain channels, and secure Ether transactions.
            </p>
            <button
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Decentralized Discord</h1>
        <div className="header-actions">
          <div className="wallet-info">
            <span className="account-badge">{formatAddress(account)}</span>
            {parseFloat(userBalance) > 0 && (
              <span className="balance-badge">{parseFloat(userBalance).toFixed(4)} ETH</span>
            )}
          </div>
          {parseFloat(userBalance) > 0 && (
            <button className="btn btn-success" onClick={withdraw} disabled={loading}>
              Withdraw
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Channels</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateChannelModal(true)}>
              +
            </button>
          </div>
          <div className="channels-list">
            {channels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${currentChannel?.id === channel.id ? 'active' : ''}`}
                onClick={() => {
                  if (channel.hasAccess) {
                    setCurrentChannel(channel);
                  } else {
                    if (window.confirm(`Join ${channel.name}? ${channel.isPrivate ? `Price: ${ethers.formatEther(channel.accessPrice)} ETH` : 'Free'}`)) {
                      joinChannel(channel);
                    }
                  }
                }}
              >
                <span className="channel-name">
                  # {channel.name}
                  {channel.isPrivate && <span className="channel-badge">Private</span>}
                </span>
                {!channel.hasAccess && <span>🔒</span>}
              </div>
            ))}
            {channels.length === 0 && (
              <p style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No channels yet. Create one!
              </p>
            )}
          </div>
        </div>

        <div className="chat-area">
          {currentChannel ? (
            <>
              <div className="chat-header">
                <h3># {currentChannel.name}</h3>
              </div>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p>No messages yet. Be the first to say something!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id} className="message">
                      <div className="message-header">
                        <span className="message-author">{formatAddress(msg.sender)}</span>
                        <span className="message-time">{formatDate(msg.timestamp)}</span>
                      </div>
                      <div className="message-content">{msg.content}</div>
                      {msg.tipAmount > 0 && (
                        <div className="message-actions">
                          <span className="tip-badge">💰 {ethers.formatEther(msg.tipAmount)} ETH tips</span>
                        </div>
                      )}
                      {msg.sender !== account && (
                        <div className="message-actions">
                          <button
                            className="btn btn-success"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => tipMessage(index)}
                          >
                            Tip
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    className="message-input"
                    placeholder={`Message #${currentChannel.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a channel to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {showCreateChannelModal && (
        <div className="modal-overlay" onClick={() => setShowCreateChannelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowCreateChannelModal(false)}>&times;</span>
            <h2>Create Channel</h2>
            <div className="form-group">
              <label>Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="general"
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label>Private Channel</label>
            </div>
            {isPrivate && (
              <div className="form-group">
                <label>Access Price (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={accessPrice}
                  onChange={(e) => setAccessPrice(e.target.value)}
                  placeholder="0.05"
                />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => setShowCreateChannelModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createChannel} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
