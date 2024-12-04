use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::program::AsterizmInitializer;

pub const SETTINGS_LEN: usize = 1       // is initialized
    + PUBKEY_BYTES                      // manager
    + 1                                 // bump
    + 8                                 // local_chain_id
    + 100; // reserve

#[account]
#[derive(Default)]
pub struct InitializerSettings {
    pub is_initialized: bool,
    pub manager: Pubkey,
    pub bump: u8,
    pub local_chain_id: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority,
    space = 8 + SETTINGS_LEN,
    seeds = ["settings".as_bytes()], bump)]
    pub settings_account: Box<Account<'info, InitializerSettings>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSettings<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, InitializerSettings>,
    #[account(constraint = program.programdata_address() == Ok(Some(program_data.key())))]
    pub program: Program<'info, AsterizmInitializer>,
    #[account(
    constraint = program_data.upgrade_authority_address == Some(authority.key())
    || authority.key() == settings_account.manager
    )]
    pub program_data: Account<'info, ProgramData>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct CreateInitializerSettingsEvent {
    pub address: Pubkey,
    pub manager: Pubkey,
    pub local_chain_id: u64,
}

#[event]
pub struct UpdateInitializerSettingsEvent {
    pub address: Pubkey,
    pub manager: Pubkey,
}
