use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::InitializerSettings;

pub const BLOCKED_ACCOUNT_LEN: usize = 1 // is blocked
+ 8                                       // chain_id
+ PUBKEY_BYTES                            // user_address
+ 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct BlockedAccount {
    pub is_blocked: bool,
    pub chain_id: u64,
    pub user_address: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(chain_id: u64, user_address: Pubkey)]
pub struct BlockAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    seeds = ["settings".as_bytes()],
    bump = settings_account.bump,
    constraint = authority.key() == settings_account.manager
    )]
    pub settings_account: Box<Account<'info, InitializerSettings>>,
    #[account(init, payer = authority,
    space = 8 + BLOCKED_ACCOUNT_LEN,
    seeds = ["blocked".as_bytes(), &chain_id.to_le_bytes(), &user_address.to_bytes()], bump)]
    pub blocked_account: Box<Account<'info, BlockedAccount>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(chain_id: u64, user_address: Pubkey)]
pub struct UnblockAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    seeds = ["settings".as_bytes()],
    bump = settings_account.bump,
    constraint = authority.key() == settings_account.manager
    )]
    pub settings_account: Box<Account<'info, InitializerSettings>>,
    #[account(mut,
    seeds = ["blocked".as_bytes(), &chain_id.to_le_bytes(), &user_address.to_bytes()], bump)]
    pub blocked_account: Box<Account<'info, BlockedAccount>>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct BlockAccountEvent {
    pub address: Pubkey,
    pub chain_id: u64,
    pub user_address: Pubkey,
}
