# Hybrid AMM Frontend

A simple React-based frontend for interacting with the Hybrid AMM Solana program.

## Features

- Connect to Solana wallets (Phantom, Solflare)
- View pool information
- Swap tokens
- Deposit and withdraw liquidity
- Admin controls for locking/unlocking the pool

## Getting Started

### Prerequisites

- Node.js 16.0.0 or later
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

#### Quick Setup

Run the setup script which will automatically install all dependencies with the correct configuration:

```bash
./setup.sh
```

If you encounter any issues with the setup, run the troubleshooting script:

```bash
./fix-frontend.sh
```

### Running the Application

Start the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Troubleshooting

If you encounter issues with the frontend setup, use the troubleshooting script:

```bash
# Run the troubleshooting script
./fix-frontend.sh
```

This script will:
1. Check for missing dependencies and install them
2. Verify react-app-rewired is installed correctly
3. Install required polyfills
4. Create or verify config-overrides.js
5. Update package.json scripts if needed

Common issues and solutions:

1. **"react-app-rewired: not found" error**:
   - Run `./fix-frontend.sh` to install it automatically
   - Or manually: `npm install react-app-rewired --save-dev --legacy-peer-deps`

2. **Node.js polyfill errors**:
   - Make sure you've installed all dependencies with the `--legacy-peer-deps` flag
   - Check that you have the correct config-overrides.js file with all necessary polyfills
   - Try clearing your browser cache and restarting the development server

3. **Dependency conflicts**:
   - Clean your installation: `rm -rf node_modules package-lock.json`
   - Reinstall with: `npm install --legacy-peer-deps`

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Select your wallet provider from the modal
3. Approve the connection request in your wallet

### Swapping Tokens

1. Select the "Swap" tab
2. Enter the amount of tokens you want to swap
3. Review the estimated output amount and slippage
4. Click "Swap" to execute the transaction

### Managing Liquidity

1. Select the "Liquidity" tab
2. Choose "Deposit" to add liquidity or "Withdraw" to remove liquidity
3. For deposits, enter the amount of one token and the other will be calculated automatically
4. For withdrawals, enter the amount of LP tokens you want to burn
5. Click "Deposit" or "Withdraw" to execute the transaction

### Admin Controls

If you're the admin, you'll see an additional "Admin" tab where you can:
1. View the current pool status
2. Lock or unlock the pool

## Development Notes

This frontend is designed to work with the Hybrid AMM Solana program. The integration is currently mocked for demonstration purposes. To connect to the actual program:

1. Update the `PROGRAM_ID` in `src/utils/ammProgram.js`
2. Implement the actual instruction creation and transaction submission logic
3. Update the admin check logic to use the actual admin public key

## License

This project is licensed under the MIT License - see the LICENSE file for details.
