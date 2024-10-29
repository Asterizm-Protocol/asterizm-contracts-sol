use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::ClientProgramSettings;

pub const CLIENT_ACCOUNT_LEN: usize = 1   // is_initialized
+ 128                                     // tx_id
+ PUBKEY_BYTES                            // user_address
+ PUBKEY_BYTES                            // relay
+ 1                                       // notify_transfer_sending_result
+ 1                                       // disable_hash_validation
+ 1                                       // refund_enabled
+ 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct ClientAccount {
    pub is_initialized: bool,
    pub tx_id: u128,
    pub user_address: Pubkey,
    pub relay_owner: Pubkey,
    pub notify_transfer_sending_result: bool,
    pub disable_hash_validation: bool,
    pub refund_enabled: bool,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey)]
pub struct CreateClientAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump,
    )]
    pub settings_account: Box<Account<'info, ClientProgramSettings>>,
    #[account(
        init,
        payer = authority,
        space = 8 + CLIENT_ACCOUNT_LEN,
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct ClientCreatedEvent {
    pub address: Pubkey,
    pub user_address: Pubkey,
    pub relay_owner: Pubkey,
    pub notify_transfer_sending_result: bool,
    pub disable_hash_validation: bool,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey)]
pub struct UpdateClientAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump,
    )]
    pub settings_account: Box<Account<'info, ClientProgramSettings>>,
    #[account(mut,
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump,
        constraint = user_address == authority.key()
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
}

#[event]
pub struct ClientUpdatedEvent {
    pub address: Pubkey,
    pub user_address: Pubkey,
    pub relay_owner: Pubkey,
    pub notify_transfer_sending_result: bool,
    pub disable_hash_validation: bool,
    pub refund_enabled: bool,
}
