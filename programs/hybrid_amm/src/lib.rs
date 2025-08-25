pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod events;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use events::*;


declare_id!("7DonoNgUsMjGj89yCDSZhaN2Cxy3YhfCYx6HoSWqzXyz");

#[program]
pub mod hybrid_amm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16, authority: Option<Pubkey>) -> Result<()> {
        ctx.accounts.init(seed, fee, authority, &ctx.bumps)?;

        emit!(InitializeEvent {
            admin : ctx.accounts.admin.key(),
            mint_x: ctx.accounts.mint_x.key(),
            mint_y: ctx.accounts.mint_y.key(),
            mint_lp: ctx.accounts.mint_lp.key(),
            vault_x: ctx.accounts.vault_x.key(),
            vault_y: ctx.accounts.vault_y.key(),
            config: ctx.accounts.config.key(),
            fee: fee,
        });

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, max_x: u64, max_y: u64) -> Result<()> {
        ctx.accounts.deposit(amount, max_x, max_y)?;

        emit!(DepositEvent {
            user : ctx.accounts.user.key(),
            mint_x: ctx.accounts.mint_x.key(),
            mint_y: ctx.accounts.mint_y.key(),
            mint_lp: ctx.accounts.mint_lp.key(),
            vault_x: ctx.accounts.vault_x.key(),
            vault_y: ctx.accounts.vault_y.key(),
            config: ctx.accounts.config.key(),
            user_lp: ctx.accounts.user_lp.key(),
            amount,
            max_x,
            max_y
        });

        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, is_x: bool, amount: u64, min: u64) -> Result<()> {
        ctx.accounts.swap(is_x,amount,min)?;

        emit!(SwapEvent {
            user : ctx.accounts.user.key(),
            mint_x: ctx.accounts.mint_x.key(),
            mint_y: ctx.accounts.mint_y.key(),
            mint_lp: ctx.accounts.mint_lp.key(),
            vault_x: ctx.accounts.vault_x.key(),
            vault_y: ctx.accounts.vault_y.key(),
            config: ctx.accounts.config.key(),
            amount,
            min
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, min_x: u64, min_y: u64) -> Result<()> {
        ctx.accounts.withdraw(amount, min_x, min_y)?;

        emit!(WithdrawEvent {
            user : ctx.accounts.user.key(),
            mint_x: ctx.accounts.mint_x.key(),
            mint_y: ctx.accounts.mint_y.key(),
            mint_lp: ctx.accounts.mint_lp.key(),
            vault_x: ctx.accounts.vault_x.key(),
            vault_y: ctx.accounts.vault_y.key(),
            config: ctx.accounts.config.key(),
            user_lp: ctx.accounts.user_lp.key(),
            amount,
            min_x,
            min_y
        });

        Ok(())

    }

    pub fn lock(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.lock()?;

        emit!(LockEvent {
            user: ctx.accounts.user.key(),
            config: ctx.accounts.config.key(),
        });

        Ok(())
    }

    pub fn unlock(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.unlock()?;

        emit!(UnlockEvent {
            user: ctx.accounts.user.key(),
            config: ctx.accounts.config.key(),
        });

        Ok(())
    }
}