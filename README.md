# Decentralized Discord DApp

A blockchain-powered messaging platform built with Ethereum smart contracts, React, and Web3. Features include on-chain channel creation, NFT-based access control, secure Ether transactions, and a Discord-like chat interface.

## Features

### Smart Contract Features

- **On-Chain Channel Management**: Create public or private channels stored on the blockchain
- **NFT-Based Access Control**: Mint membership NFTs (Basic, Premium, VIP tiers) for exclusive access
- **Secure Ether Transactions**: Pay to join private channels, tip messages, and withdraw earnings
- **Message Storage**: All messages are stored permanently on-chain
- **Access Control**: Channel creators set access prices for private channels
- **Tipping System**: Reward great content by tipping messages with ETH

### Frontend Features

- **Wallet Integration**: Connect MetaMask wallet seamlessly
- **Dynamic Channel Navigation**: Browse and join available channels
- **Real-Time Chat Interface**: Discord-style messaging UI
- **User Balance Tracking**: View and withdraw accumulated ETH
- **Responsive Design**: Modern, dark-themed Discord-inspired interface

## Tech Stack

- **Smart Contracts**: Solidity 0.8.20
- **Blockchain Framework**: Hardhat
- **Contract Libraries**: OpenZeppelin (ERC721, Ownable, ReentrancyGuard)
- **Frontend**: React 18
- **Web3 Library**: ethers.js v6
- **Styling**: Custom CSS with Discord-inspired design

## Project Structure

```
discord4/
├── contracts/
│   ├── DecentralizedDiscord.sol    # Main channel & messaging contract
│   └── DiscordNFT.sol              # NFT membership contract
├── scripts/
│   └── deploy.js                   # Deployment script
├── test/
│   └── DecentralizedDiscord.test.js # Contract tests
├── client/
│   ├── src/
│   │   ├── App.js                  # Main React component
│   │   ├── App.css                 # Styles
│   │   ├── Web3Context.js          # Web3 provider
│   │   └── index.js                # Entry point
│   └── public/
└── hardhat.config.js               # Hardhat configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd discord4
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Running Locally

1. **Start Hardhat Local Network**

```bash
npx hardhat node
```

This will start a local Ethereum network on `http://127.0.0.1:8545/`

2. **Deploy Smart Contracts** (in a new terminal):

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy the contracts and save the addresses and ABIs to `client/src/contracts.json`

3. **Start React Frontend** (in a new terminal):

```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

4. **Configure MetaMask**:
   - Add localhost network to MetaMask:
     - Network Name: Localhost 8545
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 1337
     - Currency Symbol: ETH
   - Import test accounts from Hardhat using the private keys shown in the console

### Running Tests

```bash
npx hardhat test
```

This will run all contract tests including:

- Channel creation and management
- Access control and payments
- Messaging functionality
- Tipping system
- Withdrawals
- NFT minting and tier management

## Smart Contracts

### DecentralizedDiscord.sol

Main contract handling channels and messages.

**Key Functions:**

- `createChannel(name, isPrivate, accessPrice)` - Create a new channel
- `joinChannel(channelId)` - Join a channel (pay if required)
- `sendMessage(channelId, content)` - Send a message to a channel
- `tipMessage(channelId, messageIndex)` - Tip a message with ETH
- `withdraw()` - Withdraw accumulated balance
- `getChannelMessages(channelId)` - Retrieve all messages in a channel

**Events:**

- `ChannelCreated`
- `MessageSent`
- `ChannelAccessGranted`
- `TipSent`
- `Withdrawal`

### DiscordNFT.sol

ERC721 NFT contract for membership tiers.

**Membership Tiers:**

- BASIC (0.01 ETH)
- PREMIUM (0.05 ETH)
- VIP (0.1 ETH)

**Key Functions:**

- `mint(tier, username)` - Mint a membership NFT
- `hasPremiumAccess(user)` - Check if user has premium access
- `hasVIPAccess(user)` - Check if user has VIP access
- `getUserTier(user)` - Get user's membership tier

## Usage Guide

### Creating a Channel

1. Connect your wallet
2. Click the "+" button in the sidebar
3. Enter channel name
4. Optionally mark as private and set access price
5. Click "Create"

### Joining a Channel

1. Click on a locked channel in the sidebar
2. Confirm the prompt (pay ETH if required)
3. Channel will unlock and you can start chatting

### Sending Messages

1. Select a channel you have access to
2. Type your message in the input field
3. Press Enter or click "Send"

### Tipping Messages

1. Click "Tip" button on any message (except your own)
2. Enter amount in ETH
3. Confirm the transaction
4. The tip will be added to the message sender's balance

### Withdrawing Earnings

1. Your balance shows in the header (if > 0)
2. Click "Withdraw" button
3. Confirm the transaction
4. ETH will be sent to your wallet

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks on withdrawals
- **Access Control**: Only authorized users can view/send messages in channels
- **Ownership**: NFT contract has owner-only functions for tier pricing
- **Input Validation**: All user inputs are validated before processing
- **Safe Transfers**: Uses OpenZeppelin's secure transfer patterns

## Development

### Compile Contracts

```bash
npx hardhat compile
```

### Clean Build Artifacts

```bash
npx hardhat clean
```

### Deploy to Testnet

Update `hardhat.config.js` with your testnet configuration:

```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

Then deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Future Enhancements

- [ ] Real-time message updates using The Graph or off-chain indexing
- [ ] Rich media support (images, links)
- [ ] Direct messaging between users
- [ ] Channel moderation features
- [ ] NFT-gated channels (require specific NFT to access)
- [ ] Message reactions and threads
- [ ] User profiles and avatars
- [ ] Push notifications for new messages
- [ ] Mobile-responsive design improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for the excellent development framework
- Discord for the UI/UX inspiration
- Ethereum community for Web3 tools and resources
