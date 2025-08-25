use anchor_lang::prelude::*;

#[event]
pub struct InitializeEvent {
    pub admin: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub mint_lp: Pubkey,
    pub vault_x: Pubkey,
    pub vault_y: Pubkey,
    pub config: Pubkey,
    pub fee: u16,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub mint_lp: Pubkey,
    pub vault_x: Pubkey,
    pub vault_y: Pubkey,
    pub config: Pubkey,
    pub user_lp: Pubkey,
    pub amount: u64,
    pub max_x: u64,
    pub max_y: u64
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub mint_lp: Pubkey,
    pub vault_x: Pubkey,
    pub vault_y: Pubkey,
    pub config: Pubkey,
    pub user_lp: Pubkey,
    pub amount: u64,
    pub min_x: u64,
    pub min_y: u64
}

#[event]
pub struct LockEvent {
    pub user: Pubkey,
    pub config: Pubkey
}

#[event]
pub struct UnlockEvent {
    pub user: Pubkey,
    pub config: Pubkey
}

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub mint_lp: Pubkey,
    pub vault_x: Pubkey,
    pub vault_y: Pubkey,
    pub config: Pubkey,
    pub amount: u64,
    pub min: u64,
}
