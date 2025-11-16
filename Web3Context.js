import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [discordContract, setDiscordContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Set up provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);

      // Load contracts
      await loadContracts(web3Signer);

      console.log('Wallet connected:', accounts[0]);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadContracts = async (signer) => {
    try {
      // Try to load contract addresses from contracts.json
      const response = await fetch('/contracts.json');
      if (!response.ok) {
        throw new Error('Contracts not deployed. Please deploy contracts first.');
      }

      const contractsData = await response.json();

      // Initialize DecentralizedDiscord contract
      const discord = new ethers.Contract(
        contractsData.DecentralizedDiscord.address,
        contractsData.DecentralizedDiscord.abi,
        signer
      );

      // Initialize DiscordNFT contract
      const nft = new ethers.Contract(
        contractsData.DiscordNFT.address,
        contractsData.DiscordNFT.abi,
        signer
      );

      setDiscordContract(discord);
      setNftContract(nft);

      console.log('Contracts loaded successfully');
    } catch (err) {
      console.error('Error loading contracts:', err);
      throw new Error(`Failed to load contracts: ${err.message}`);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setDiscordContract(null);
    setNftContract(null);
    setError(null);
  };

  const value = {
    provider,
    signer,
    account,
    discordContract,
    nftContract,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isConnected: !!account
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
