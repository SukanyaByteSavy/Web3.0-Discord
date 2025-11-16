# Quick Start Guide

Get your Decentralized Discord DApp running in 5 minutes!

## Prerequisites

- Node.js installed (v16+)
- MetaMask browser extension installed

## Setup Steps

### 1. Install Dependencies (2 minutes)

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Start Local Blockchain (30 seconds)

Open a terminal and run:
```bash
npm run node
```

Keep this terminal open. You'll see 20 test accounts with private keys.

### 3. Deploy Contracts (30 seconds)

Open a NEW terminal and run:
```bash
npm run deploy
```

You should see output like:
```
DecentralizedDiscord deployed to: 0x5FbDB2315678...
DiscordNFT deployed to: 0xe7f1725E7734...
```

### 4. Configure MetaMask (1 minute)

1. Open MetaMask
2. Click network dropdown → Add Network → Add a network manually
3. Fill in:
   - **Network Name**: Localhost 8545
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click "Save"
5. Import a test account:
   - Click account icon → Import Account
   - Copy a private key from the terminal running `npm run node`
   - Paste and import

### 5. Start Frontend (30 seconds)

In a NEW terminal:
```bash
npm run client
```

Browser will open at `http://localhost:3000`

### 6. Start Using the DApp!

1. Click "Connect Wallet" in the app
2. Approve the connection in MetaMask
3. Click "+" to create your first channel
4. Start chatting!

## Quick Feature Tour

### Create a Public Channel
1. Click "+" button in sidebar
2. Enter name: "general"
3. Leave "Private Channel" unchecked
4. Click "Create"
5. Approve transaction in MetaMask

### Create a Private Channel
1. Click "+" button
2. Enter name: "vip-lounge"
3. Check "Private Channel"
4. Set price: 0.01 (ETH)
5. Click "Create"
6. Approve transaction

### Join a Channel
- Click any unlocked channel to view/chat
- Click a locked channel to join (pay if required)

### Send Messages
1. Select a channel
2. Type message in input field
3. Press Enter or click "Send"

### Tip a Message
1. Find a message you like (not your own)
2. Click "Tip" button
3. Enter amount (e.g., 0.001)
4. Confirm transaction

### Withdraw Earnings
- Your balance shows in header if > 0
- Click "Withdraw" to transfer to your wallet

## Testing with Multiple Accounts

1. Import 2-3 accounts from Hardhat test accounts
2. Switch between them in MetaMask
3. Test channel creation, joining, messaging, and tipping

## Troubleshooting

### "Contracts not deployed" Error
- Make sure you ran `npm run deploy` after starting the node
- Check that `client/src/contracts.json` file exists

### MetaMask Connection Issues
- Make sure you're on the "Localhost 8545" network
- Try refreshing the page
- Reset MetaMask account if needed (Settings → Advanced → Reset Account)

### Transaction Failing
- Check you have enough test ETH in your account
- Make sure the local node is still running
- Refresh the page and try again

### "Nonce too high" Error
- Reset your MetaMask account (Settings → Advanced → Reset Account)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [contracts/](contracts/) to understand the smart contracts
- Explore [test/](test/) to see how to test the contracts
- Customize the frontend in [client/src/](client/src/)

## Running Tests

```bash
npm test
```

This runs all smart contract tests including:
- Channel creation and access control
- Messaging and tipping
- NFT minting
- Withdrawals

Happy coding!
