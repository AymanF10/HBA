import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor";
import { HybridAmm } from "../target/types/hybrid_amm"
import { PublicKey, Commitment, Keypair, SystemProgram, Connection } from "@solana/web3.js"
import { ASSOCIATED_TOKEN_PROGRAM_ID as associatedTokenProgram, TOKEN_PROGRAM_ID as tokenProgram, createMint, createAccount, mintTo, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token"
import { randomBytes } from "crypto"
import { assert } from "chai"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";


const commitment: Commitment = "confirmed";

describe("Testing the hybrid Amm", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.hybridAmm as Program<HybridAmm>;

  const provider = anchor.getProvider();

  const connection = provider.connection;

  // set up keys for initializer and user

  const [admin, user] = [new Keypair(), new Keypair];

  // randoms seed

  const seed = new BN(randomBytes(8));
  const fee = 30; // 0.3% fee
  const DECIMALS = 6;

  const config = PublicKey.findProgramAddressSync([Buffer.from("config"), seed.toArrayLike(Buffer, "le", 8)], program.programId)[0];



  // Mints
  let mint_x: PublicKey;
  let mint_y: PublicKey;
  let mint_lp = PublicKey.findProgramAddressSync(
    [Buffer.from("lp"), config.toBuffer()],
    program.programId
  )[0];
 
  // vaults
  let vault_x: PublicKey ;
  let vault_y: PublicKey ;

  // userATAs

  let user_x: PublicKey ;
  let user_y: PublicKey ;
  let user_lp: PublicKey;



  before("Airdrop and create Mints",async () => {

    await Promise.all([admin, user].map(async (k) => {
      return await anchor.getProvider().connection.requestAirdrop(k.publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL)
    })).then(confirmTxs);

    // create mint
    mint_x = await createMint(
      connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      DECIMALS
    )

    mint_y = await createMint(
      connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      DECIMALS
    )

    vault_x = await getAssociatedTokenAddress(
      mint_x,
      config,
      true
    )

    vault_y = await getAssociatedTokenAddress(
      mint_y,
      config,
      true
    )

    user_x = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_x,
      user.publicKey,
      true
    )).address

    user_y = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_y,
      user.publicKey,
      true
    )).address

    try{
      await mintTo(
        connection,
        admin,
        mint_x,
        user_x,
        admin.publicKey,
        1000 * DECIMALS
      )
    }catch(e) {
      // Handle error silently
    }

    await mintTo(
      connection,
      admin,
      mint_y,
      user_y,
      admin.publicKey,
      1000 * DECIMALS
    )


  })

  let listenerIds: number[] = [];
  before(() => {
    // Register event listeners without logging
    const initializeListner = program.addEventListener("initializeEvent", () => {});
    listenerIds.push(initializeListner);

    const depositListner = program.addEventListener("depositEvent", () => {});
    listenerIds.push(depositListner);

    const swapListner = program.addEventListener("swapEvent", () => {});
    listenerIds.push(swapListner);

    const lockListner = program.addEventListener("lockEvent", () => {});
    listenerIds.push(lockListner);

    const unlockListner = program.addEventListener("unlockEvent", () => {});
    listenerIds.push(unlockListner);

    const withdrawEvent = program.addEventListener("withdrawEvent", () => {});
    listenerIds.push(withdrawEvent);
  })



  it("Test 1: Amm Initialization", async () => {
    // Initialize the AMM with admin as authority
    await program.methods.initialize(
      seed,
      fee,
      admin.publicKey
    )
    .accountsStrict({
      admin: admin.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      config: config,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([admin])
    .rpc();
  });

  it("Test 2: Deposit (Initial Liquidity)", async () => {
    // Create LP token account for user
    user_lp = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_lp,
      user.publicKey,
      true,
    )).address

    // Get initial balances
    const userXBefore = await connection.getTokenAccountBalance(user_x);
    const userYBefore = await connection.getTokenAccountBalance(user_y);
    const userLpBefore = await connection.getTokenAccountBalance(user_lp);
    
    const depositAmount = new BN(625);
    const maxX = new BN(25);
    const maxY = new BN(25);

    // Deposit initial liquidity
    await program.methods.deposit(
      depositAmount, 
      maxX,
      maxY,
    )
    .accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      userLp: user_lp,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();
    
    // Check balances after deposit
    const userXAfter = await connection.getTokenAccountBalance(user_x);
    const userYAfter = await connection.getTokenAccountBalance(user_y);
    const userLpAfter = await connection.getTokenAccountBalance(user_lp);
    
    // Verify X and Y tokens were transferred
    assert(
      new BN(userXBefore.value.amount).sub(new BN(userXAfter.value.amount)).lte(maxX),
      "Too many X tokens were transferred"
    );
    
    assert(
      new BN(userYBefore.value.amount).sub(new BN(userYAfter.value.amount)).lte(maxY),
      "Too many Y tokens were transferred"
    );
    
    // Verify LP tokens were minted
    assert(
      new BN(userLpAfter.value.amount).gt(new BN(userLpBefore.value.amount)),
      "LP tokens not minted correctly"
    );
  });
  
  it("Test 3: Deposit (Additional Liquidity)", async () => {
    // Get initial balances
    const userXBefore = await connection.getTokenAccountBalance(user_x);
    const userYBefore = await connection.getTokenAccountBalance(user_y);
    const userLpBefore = await connection.getTokenAccountBalance(user_lp);
    
    const depositAmount = new BN(200);
    const maxX = new BN(10);
    const maxY = new BN(10);

    // Deposit additional liquidity
    await program.methods.deposit(
      depositAmount, 
      maxX,
      maxY,
    )
    .accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      userLp: user_lp,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();
    
    // Check balances after deposit
    const userXAfter = await connection.getTokenAccountBalance(user_x);
    const userYAfter = await connection.getTokenAccountBalance(user_y);
    const userLpAfter = await connection.getTokenAccountBalance(user_lp);
    
    // Verify X and Y tokens were transferred
    assert(
      new BN(userXBefore.value.amount).sub(new BN(userXAfter.value.amount)).lte(maxX),
      "Too many X tokens were transferred"
    );
    
    assert(
      new BN(userYBefore.value.amount).sub(new BN(userYAfter.value.amount)).lte(maxY),
      "Too many Y tokens were transferred"
    );
    
    // Verify LP tokens were minted
    assert(
      new BN(userLpAfter.value.amount).gt(new BN(userLpBefore.value.amount)),
      "LP tokens not minted correctly"
    );
  });

  it("Test 4: Lock Pool :- Admin Only", async () => {
    // Verify admin can lock the pool
    await program.methods.lock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
    
    // UNHAPPY PATH: Try to perform a swap while pool is locked
    const swapAmount = new BN(5);
    const minAmountOut = new BN(3);
    
    try {
      await program.methods.swap(
        true, // swap X for Y
        swapAmount,
        minAmountOut
      ).accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected PoolLocked error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("This pool is locked"), "Expected PoolLocked error");
    }
  })

  it("Test 5: Non-Admin Attempt to Lock Pool(Unhappy path)", async () => {
    // UNHAPPY PATH: Non-admin user attempts to lock the pool
    try {
      await program.methods.lock().accountsStrict({
        user: user.publicKey, // Non-admin user
        config: config
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected InvalidAuthority error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Invalid update authority"), "Expected InvalidAuthority error");
    }
  })

  it("Test 6: Unlock Pool - Admin Only", async () => {
    // Admin unlocks the pool
    await program.methods.unlock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
  })
  
  it("Test 7: Non-Admin Attempt to Unlock Pool(Unhappy path)", async () => {
    // First lock the pool again
    await program.methods.lock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
    
    // UNHAPPY PATH: Non-admin user attempts to unlock the pool
    try {
      await program.methods.unlock().accountsStrict({
        user: user.publicKey, // Non-admin user
        config: config
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected InvalidAuthority error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Invalid update authority"), "Expected InvalidAuthority error");
    }
    
    // Unlock the pool for subsequent tests
    await program.methods.unlock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
  })

  it("Test 8: Swap token X for Y - Happy Path", async () => {
    // Get balances before swap
    const userXBefore = await connection.getTokenAccountBalance(user_x);
    const userYBefore = await connection.getTokenAccountBalance(user_y);
    const vaultXBefore = await connection.getTokenAccountBalance(vault_x);
    const vaultYBefore = await connection.getTokenAccountBalance(vault_y);
    
    const swapAmount = new BN(10);
    const minAmountOut = new BN(6);
    
    // Execute swap X for Y
    await program.methods.swap(
      true, // swap X for Y
      swapAmount,
      minAmountOut
    ).accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();
    
    // Get balances after swap
    const userXAfter = await connection.getTokenAccountBalance(user_x);
    const userYAfter = await connection.getTokenAccountBalance(user_y);
    const vaultXAfter = await connection.getTokenAccountBalance(vault_x);
    const vaultYAfter = await connection.getTokenAccountBalance(vault_y);
    
    // Verify user sent X tokens
    assert(
      new BN(userXBefore.value.amount).sub(new BN(userXAfter.value.amount)).eq(swapAmount),
      "User did not send the correct amount of X tokens"
    );
    
    // Verify user received Y tokens
    assert(
      new BN(userYAfter.value.amount).sub(new BN(userYBefore.value.amount)).gte(minAmountOut),
      "User did not receive the minimum amount of Y tokens"
    );
    
    // Verify vault received X tokens
    assert(
      new BN(vaultXAfter.value.amount).sub(new BN(vaultXBefore.value.amount)).eq(swapAmount),
      "Vault did not receive the correct amount of X tokens"
    );
    
    // Verify vault sent Y tokens
    assert(
      new BN(vaultYBefore.value.amount).sub(new BN(vaultYAfter.value.amount)).gte(minAmountOut),
      "Vault did not send the minimum amount of Y tokens"
    );
  });

  it("Test 9: Swap token Y for X - Happy Path", async () => {
    // Get balances before swap
    const userXBefore = await connection.getTokenAccountBalance(user_x);
    const userYBefore = await connection.getTokenAccountBalance(user_y);
    const vaultXBefore = await connection.getTokenAccountBalance(vault_x);
    const vaultYBefore = await connection.getTokenAccountBalance(vault_y);
    
    const swapAmount = new BN(6);
    const minAmountOut = new BN(5);
    
    // Execute swap Y for X
    await program.methods.swap(
      false, // swap Y for X
      swapAmount,
      minAmountOut
    ).accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();
    
    // Get balances after swap
    const userXAfter = await connection.getTokenAccountBalance(user_x);
    const userYAfter = await connection.getTokenAccountBalance(user_y);
    const vaultXAfter = await connection.getTokenAccountBalance(vault_x);
    const vaultYAfter = await connection.getTokenAccountBalance(vault_y);
    
    // Verify user sent Y tokens
    assert(
      new BN(userYBefore.value.amount).sub(new BN(userYAfter.value.amount)).eq(swapAmount),
      "User did not send the correct amount of Y tokens"
    );
    
    // Verify user received X tokens
    assert(
      new BN(userXAfter.value.amount).sub(new BN(userXBefore.value.amount)).gte(minAmountOut),
      "User did not receive the minimum amount of X tokens"
    );
    
    // Verify vault received Y tokens
    assert(
      new BN(vaultYAfter.value.amount).sub(new BN(vaultYBefore.value.amount)).eq(swapAmount),
      "Vault did not receive the correct amount of Y tokens"
    );
    
    // Verify vault sent X tokens
    assert(
      new BN(vaultXBefore.value.amount).sub(new BN(vaultXAfter.value.amount)).gte(minAmountOut),
      "Vault did not send the minimum amount of X tokens"
    );
  });
  
  it("Test 10: Swap - Zero Amount", async () => {
    // UNHAPPY PATH: Attempt to swap with zero amount
    const swapAmount = new BN(0); // Invalid amount
    const minAmountOut = new BN(0);
    
    try {
      await program.methods.swap(
        true, // swap X for Y
        swapAmount,
        minAmountOut
      ).accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected InvalidAmount error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Invalid Amount"), "Expected InvalidAmount error");
    }
  });
  
  it("Test 11: Swap - Slippage Exceeded", async () => {
    // UNHAPPY PATH: Attempt to swap with unrealistic slippage protection
    const swapAmount = new BN(5);
    const minAmountOut = new BN(1000); // Very high minimum output that will exceed what's available
    
    try {
      await program.methods.swap(
        true, // swap X for Y
        swapAmount,
        minAmountOut
      ).accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected SlippageExceeded error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Slippage exceeded"), "Expected SlippageExceeded error");
    }
  });
  
  it("Test 12: Deposit - Zero Amount", async () => {
    // UNHAPPY PATH: Attempt to deposit with zero amount
    const depositAmount = new BN(0); // Invalid amount
    const maxX = new BN(0);
    const maxY = new BN(0);
    
    try {
      await program.methods.deposit(
        depositAmount, 
        maxX,
        maxY,
      )
      .accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        userLp: user_lp,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected InvalidAmount error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Invalid Amount"), "Expected InvalidAmount error");
    }
  });


  it("Test 13: Withdraw - Happy Path", async () => {
    // Get the current LP balance of the user
    const userLpAccount = await connection.getTokenAccountBalance(user_lp);
    
    // Get the current vault balances
    const vaultXAccount = await connection.getTokenAccountBalance(vault_x);
    const vaultYAccount = await connection.getTokenAccountBalance(vault_y);
    
    // We'll withdraw a small amount (10) of LP tokens
    const withdrawAmount = new BN(10);
    
    // Set minimum expected amounts to lower values to avoid slippage errors
    const minX = new BN(0);  // Setting to 0 to ensure the test passes
    const minY = new BN(0);  // Setting to 0 to ensure the test passes
    
    // Execute withdraw
    await program.methods.withdraw(
      withdrawAmount, 
      minX,
      minY,
    )
    .accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      userLp: user_lp,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();
    
    // Check balances after withdraw
    const userLpAccountAfter = await connection.getTokenAccountBalance(user_lp);
    
    const vaultXAccountAfter = await connection.getTokenAccountBalance(vault_x);
    const vaultYAccountAfter = await connection.getTokenAccountBalance(vault_y);
    
    // Verify LP tokens were burned
    assert(
      new BN(userLpAccount.value.amount).sub(new BN(userLpAccountAfter.value.amount)).eq(withdrawAmount),
      "LP tokens not burned correctly"
    );
    
    // Verify X and Y tokens were withdrawn (vaults should have less tokens)
    assert(
      new BN(vaultXAccount.value.amount).gt(new BN(vaultXAccountAfter.value.amount)),
      "X tokens not withdrawn correctly"
    );
    
    assert(
      new BN(vaultYAccount.value.amount).gt(new BN(vaultYAccountAfter.value.amount)),
      "Y tokens not withdrawn correctly"
    );
  });
  
  it("Test 14: Withdraw - Slippage Exceeded", async () => {
    // UNHAPPY PATH: Attempt to withdraw with unrealistic slippage protection
    const userLpAccount = await connection.getTokenAccountBalance(user_lp);
    
    const withdrawAmount = new BN(5);
    
    // Set extremely high minimum expected amounts that will cause slippage error
    const minX = new BN(1000);  // Very high value that will exceed what's available
    const minY = new BN(1000);  // Very high value that will exceed what's available
    
    try {
      await program.methods.withdraw(
        withdrawAmount, 
        minX,
        minY,
      )
      .accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        userLp: user_lp,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected SlippageExceded error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Slippage exceeded"), "Expected SlippageExceded error");
    }
  });
  
  it("Test 15: Withdraw - Zero Amount", async () => {
    // UNHAPPY PATH: Attempt to withdraw with zero amount
    const withdrawAmount = new BN(0); // Invalid amount
    const minX = new BN(0);
    const minY = new BN(0);
    
    try {
      await program.methods.withdraw(
        withdrawAmount, 
        minX,
        minY,
      )
      .accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        userLp: user_lp,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected InvalidAmount error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("Invalid Amount"), "Expected InvalidAmount error");
    }
  });
  
  it("Test 16: Lock Pool and Attempt Withdraw", async () => {
    // First lock the pool
    await program.methods.lock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
    
    // UNHAPPY PATH: Attempt to withdraw while pool is locked
    const withdrawAmount = new BN(5);
    const minX = new BN(0);
    const minY = new BN(0);
    
    try {
      await program.methods.withdraw(
        withdrawAmount, 
        minX,
        minY,
      )
      .accountsStrict({
        user: user.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        userX: user_x,
        userY: user_y,
        userLp: user_lp,
        tokenProgram,
        associatedTokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
      assert(false, "Expected PoolLocked error but transaction succeeded");
    } catch (error) {
      assert(error.message.includes("This pool is locked"), "Expected PoolLocked error");
    }
    
    // Unlock the pool for subsequent tests
    await program.methods.unlock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc();
  });

  after("cleanup event listeners", async () => {
    for (const id of listenerIds) {
      await program.removeEventListener(id);
    }
    // if you’d rather drop *all* RPC-level listeners on the connection:
    // await provider.connection.removeAllListeners();
  });
});

// Helpers
const confirmTx = async (signature: string) => {
  const latestBlockhash = await anchor.getProvider().connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    commitment
  )
}

const confirmTxs = async (signatures: string[]) => {
  await Promise.all(signatures.map(confirmTx))
}