use anchor_lang::prelude::*;

use crate::RelayerSettings;

pub const CHAIN_LEN: usize = 1       // is initialized
    + 100                                   // name
    + 8                                       // id
    + 1                                       // chain_type
    + 1                                       // bump
    + 100; // reserve

#[account]
#[derive(Default)]
pub struct Chain {
    pub is_initialized: bool,
    pub name: String,
    pub id: u64,
    pub chain_type: u8,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateChain<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    constraint = authority.key() == settings_account.manager,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(init, payer = authority,
    space = 8 + CHAIN_LEN,
    seeds = ["chain".as_bytes(), &id.to_le_bytes()], bump)]
    pub chain_account: Box<Account<'info, Chain>>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct CreateChainEvent {
    pub address: Pubkey,
    pub name: String,
    pub id: u64,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct UpdateChainType<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    constraint = authority.key() == settings_account.manager,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(mut,
    seeds = ["chain".as_bytes(), &id.to_le_bytes()], bump)]
    pub chain_account: Box<Account<'info, Chain>>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct UpdateChainTypeEvent {
    pub address: Pubkey,
    pub chain_type: u8,
    pub id: u64,
}
