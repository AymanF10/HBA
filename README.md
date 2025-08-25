# Hybrid AMM (Automated Market Maker)

A decentralized exchange protocol built on Solana using the Anchor framework. This AMM implements a constant product market maker algorithm (x * y = k) for token swaps with minimal price slippage.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Accounts](#key-accounts)
- [Key Features](#key-features)
- [Program Instructions](#program-instructions)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Frontend](#frontend)

## Overview

This Hybrid AMM is a Solana-based decentralized exchange that allows users to:
- Create liquidity pools for token pairs
- Add liquidity to earn fees
- Swap between tokens with minimal slippage
- Withdraw liquidity as needed

The protocol uses a constant product formula (x * y = k) to determine exchange rates, ensuring that the product of the quantities of the two tokens in the pool remains constant after each trade, minus fees.

## Architecture

The Hybrid AMM consists of several key components:

```mermaid
flowchart TB
    subgraph "Hybrid AMM Architecture"
        User([User])
        Admin([Admin])
        
        subgraph "Core Components"
            Config[Config Account]
            VaultX[Token X Vault]
            VaultY[Token Y Vault]
            LPToken[LP Token Mint]
        end
        
        subgraph "Instructions"
            Initialize["Initialize Pool"]
            Deposit["Deposit Liquidity"]
            Withdraw["Withdraw Liquidity"]
            Swap["Swap Tokens"]
            Lock["Lock Pool"]
            Unlock["Unlock Pool"]
        end
        
        User --> Deposit
        User --> Withdraw
        User --> Swap
        
        Admin --> Initialize
        Admin --> Lock
        Admin --> Unlock
        
        Initialize --> Config
        Initialize --> VaultX
        Initialize --> VaultY
        Initialize --> LPToken
        
        Deposit --> VaultX
        Deposit --> VaultY
        Deposit --> LPToken
        
        Withdraw --> VaultX
        Withdraw --> VaultY
        Withdraw --> LPToken
        
        Swap --> VaultX
        Swap --> VaultY
        
        Lock --> Config
        Unlock --> Config
    end
```

### Key Accounts

1. **Config Account**: Stores pool parameters, including:
   - Token X and Y mint addresses
   - Fee percentage
   - Admin authority
   - Lock status
   - PDAs bump seeds

2. **Token Vaults**: Secure storage for pool tokens:
   - Vault X: Holds Token X reserves
   - Vault Y: Holds Token Y reserves

3. **LP Token Mint**: Represents user's share in the liquidity pool

## Key Features

1. **Constant Product Formula**
   - Uses x * y = k formula for price determination
   - Ensures price stability with larger liquidity pools

2. **Fee Mechanism**
   - Configurable fee percentage (default: 0.3%)
   - Fees accrue to liquidity providers

3. **Slippage Protection**
   - Users can set minimum output amounts for swaps
   - Users can set maximum input amounts for deposits

4. **Pool Security**
   - Admin-controlled pool locking mechanism
   - Authority checks for administrative actions

5. **Event Emission**
   - Detailed events for all operations for off-chain tracking

## Program Instructions

The Hybrid AMM program provides the following instructions:

- [Initialize](#initialize) - Create a new liquidity pool
- [Deposit](#deposit) - Add liquidity to the pool
- [Swap](#swap) - Exchange tokens in the pool
- [Withdraw](#withdraw) - Remove liquidity from the pool
- [Lock](#lockunlock) - Lock the pool (admin only)
- [Unlock](#lockunlock) - Unlock the pool (admin only)

```mermaid
sequenceDiagram
    participant User
    participant Admin
    participant AMM as Hybrid AMM Program
    
    Admin->>AMM: Initialize(seed, fee, authority)
    Note over AMM: Creates config, vaults, and LP token mint
    
    User->>AMM: Deposit(amount, max_x, max_y)
    Note over AMM: Transfers tokens to vaults, mints LP tokens
    
    User->>AMM: Swap(is_x, amount, min_out)
    Note over AMM: Transfers input token to vault, sends output token to user
    
    User->>AMM: Withdraw(amount, min_x, min_y)
    Note over AMM: Burns LP tokens, returns X and Y tokens
    
    Admin->>AMM: Lock()
    Note over AMM: Prevents swaps and withdrawals
    
    Admin->>AMM: Unlock()
    Note over AMM: Re-enables swaps and withdrawals
```

### Initialize

Creates a new liquidity pool for a token pair.

**Parameters:**
- `seed`: Unique identifier for the pool
- `fee`: Fee percentage (in basis points, e.g., 30 = 0.3%)
- `authority`: Optional custom admin authority

**Process:**
1. Creates config account with pool parameters
2. Creates token vaults for X and Y tokens
3. Creates LP token mint
4. Sets admin authority

### Deposit

Adds liquidity to the pool.

**Parameters:**
- `amount`: Desired LP token amount
- `max_x`: Maximum Token X to deposit
- `max_y`: Maximum Token Y to deposit

**Process:**
```mermaid
flowchart TD
    A[Start Deposit] --> B{First Deposit?}
    B -->|Yes| C[Equal Value Deposit]
    B -->|No| D[Proportional Deposit]
    C --> E[Calculate Token Amounts]
    D --> E
    E --> F[Transfer Tokens to Vaults]
    F --> G[Mint LP Tokens]
    G --> H[End Deposit]
```

1. Calculates required amounts of Token X and Y
2. Ensures amounts are within user's specified maximums
3. Transfers tokens to respective vaults
4. Mints LP tokens to user representing their share

### Swap

Exchanges one token for another.

**Parameters:**
- `is_x`: Direction of swap (true = X→Y, false = Y→X)
- `amount`: Amount of input token
- `min`: Minimum amount of output token expected

**Process:**
```mermaid
flowchart TD
    A[Start Swap] --> B{Pool Locked?}
    B -->|Yes| C[Fail: Pool Locked]
    B -->|No| D{is_x?}
    D -->|Yes| E[Swap X for Y]
    D -->|No| F[Swap Y for X]
    E --> G[Calculate Output Using x*y=k]
    F --> G
    G --> H{Output >= min?}
    H -->|No| I[Fail: Slippage Exceeded]
    H -->|Yes| J[Transfer Tokens]
    J --> K[End Swap]
```

1. Verifies pool is not locked
2. Calculates output amount using constant product formula
3. Ensures output meets minimum requirement (slippage protection)
4. Transfers input token from user to vault
5. Transfers output token from vault to user

### Withdraw

Removes liquidity from the pool.

**Parameters:**
- `amount`: LP token amount to burn
- `min_x`: Minimum Token X expected
- `min_y`: Minimum Token Y expected

**Process:**
```mermaid
flowchart TD
    A[Start Withdraw] --> B{Pool Locked?}
    B -->|Yes| C[Fail: Pool Locked]
    B -->|No| D[Calculate Token Amounts]
    D --> E{Amounts >= Minimums?}
    E -->|No| F[Fail: Slippage Exceeded]
    E -->|Yes| G[Burn LP Tokens]
    G --> H[Transfer Tokens to User]
    H --> I[End Withdraw]
```

1. Verifies pool is not locked
2. Calculates proportional amounts of Token X and Y
3. Ensures amounts meet minimum requirements
4. Burns LP tokens
5. Transfers tokens from vaults to user

### Lock/Unlock

Controls the operational status of the pool.

**Process:**
1. Verifies caller is the admin authority
2. Updates the locked status in the config account

## Getting Started

### Prerequisites

- Rust 1.68.0 or later
- Solana CLI 1.16.0 or later
- Anchor Framework 0.29.0 or later
- Node.js 16.0.0 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hybrid_amm.git
cd hybrid_amm
```

2. Install dependencies:
```bash
npm install
```

3. Build the program:
```bash
anchor build
```

4. Deploy to a local validator:
```bash
solana-test-validator
anchor deploy
```

## Testing

The project includes comprehensive tests covering both happy and unhappy paths:

### Test Structure

```mermaid
flowchart TD
    A[Test Suite] --> B[Setup Tests]
    B --> C[Initialization Tests]
    C --> D[Deposit Tests]
    D --> E[Admin Control Tests]
    E --> F[Swap Tests]
    F --> G[Withdraw Tests]
    
    subgraph "Happy Path Tests"
        C1[Initialize AMM]
        D1[Initial Deposit]
        D2[Additional Deposit]
        E1[Admin Lock/Unlock]
        F1[Swap X for Y]
        F2[Swap Y for X]
        G1[Withdraw Liquidity]
    end
    
    subgraph "Unhappy Path Tests"
        E2[Non-admin Lock Attempt]
        E3[Non-admin Unlock Attempt]
        F3[Zero Amount Swap]
        F4[Slippage Exceeded Swap]
        G2[Zero Amount Withdraw]
        G3[Slippage Exceeded Withdraw]
        G4[Withdraw from Locked Pool]
    end
```

Run the tests with:
```bash
anchor test
```

## Frontend

The project includes a simple React-based frontend for interacting with the Hybrid AMM program.

### Features

- Connect to Solana wallets (Phantom, Solflare)
- View pool information
- Swap tokens
- Deposit and withdraw liquidity
- Admin controls for locking/unlocking the pool

### Getting Started with the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Run the setup script:
```bash
./setup.sh
```

3. If you encounter any issues, run the troubleshooting script:
```bash
./fix-frontend.sh
```

4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

#### Troubleshooting Frontend Setup

If you encounter issues with the frontend setup, use the troubleshooting script:

```bash
./fix-frontend.sh
```

This script will automatically:
- Check for missing dependencies and install them
- Verify react-app-rewired is installed correctly
- Install required polyfills
- Create or verify config-overrides.js
- Update package.json scripts if needed


For more details, see the Frontend README in the frontend directory.
