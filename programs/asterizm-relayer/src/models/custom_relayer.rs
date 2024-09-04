use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::RelayerSettings;

pub const CUSTOM_RELAYER_LEN: usize = 1       // is initialized
    + PUBKEY_BYTES                            // address
    + 8                                       // fee
    + 1                                       // bump
    + 100; // reserve

#[account]
#[derive(Default)]
pub struct CustomRelayer {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub fee: u64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(owner: Pubkey)]
pub struct CreateCustomRelay<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    constraint = authority.key() == settings_account.manager,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(init, payer = authority,
    space = 8 + CUSTOM_RELAYER_LEN,
    seeds = ["relay".as_bytes(), owner.as_ref()], bump)]
    pub relay_account: Box<Account<'info, CustomRelayer>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(owner: Pubkey)]
pub struct UpdateCustomRelay<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    constraint = authority.key() == settings_account.manager || authority.key() == relay_account.owner,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(mut,
    seeds = ["relay".as_bytes(), owner.as_ref()], bump = relay_account.bump)]
    pub relay_account: Account<'info, CustomRelayer>,
}

#[event]
pub struct CreateCustomRelayEvent {
    pub address: Pubkey,
    pub owner: Pubkey,
    pub fee: u64,
}

#[event]
pub struct UpdateCustomRelayEvent {
    pub address: Pubkey,
    pub owner: Pubkey,
    pub fee: u64,
}
