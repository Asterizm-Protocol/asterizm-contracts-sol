use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::program::AsterizmRelayer;
use crate::CHAIN_LEN;
use crate::CUSTOM_RELAYER_LEN;
use crate::{Chain, CustomRelayer};

pub const SETTINGS_LEN: usize = 1       // is initialized
    + PUBKEY_BYTES                      // manager
    + PUBKEY_BYTES                      // system relayer
    + 1                                 // bump
    + 8                                 // local_chain_id
    + 8                                 // system_fee
    + 100; // reserve

#[account]
#[derive(Default)]
pub struct RelayerSettings {
    pub is_initialized: bool,
    pub manager: Pubkey,
    pub system_relayer_owner: Pubkey,
    pub bump: u8,
    pub local_chain_id: u64,
    pub system_fee: u64,
}

#[derive(Accounts)]
#[instruction(system_relayer_owner: Pubkey, local_chain_id: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority,
    space = 8 + SETTINGS_LEN,
    seeds = ["settings".as_bytes()], bump)]
    pub settings_account: Box<Account<'info, RelayerSettings>>,
    #[account(init, payer = authority,
    space = 8 + CUSTOM_RELAYER_LEN,
    seeds = ["relay".as_bytes(), system_relayer_owner.as_ref()], bump)]
    pub relay_account: Box<Account<'info, CustomRelayer>>,
    #[account(init, payer = authority,
    space = 8 + CHAIN_LEN,
    seeds = ["chain".as_bytes(), &local_chain_id.to_le_bytes()], bump)]
    pub chain_account: Box<Account<'info, Chain>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSettings<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(constraint = program.programdata_address() == Ok(Some(program_data.key())))]
    pub program: Program<'info, AsterizmRelayer>,
    #[account(
    constraint = program_data.upgrade_authority_address == Some(authority.key())
    || authority.key() == settings_account.manager
    )]
    pub program_data: Account<'info, ProgramData>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct CreateRelayerSettingsEvent {
    pub address: Pubkey,
    pub manager: Pubkey,
    pub system_relayer_owner: Pubkey,
    pub local_chain_id: u64,
    pub system_fee: u64,
}

#[event]
pub struct UpdateRelayerSettingsEvent {
    pub address: Pubkey,
    pub manager: Pubkey,
    pub system_fee: u64,
}
