use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::ClientAccount;

pub const CLIENT_TRUSTED_ADDRESS_ACCOUNT_LEN: usize = 1 // is is_initialized
+ PUBKEY_BYTES                            // user_address
+ PUBKEY_BYTES                            // address
+ 8                                       // chain_id
+ 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct ClientTrustedAddress {
    pub is_initialized: bool,
    pub user_address: Pubkey,
    pub address: Pubkey,
    pub chain_id: u64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, chain_id: u64)]
pub struct CreateClientTrustedAddress<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        init,
        payer = payer,
        space = 8 + CLIENT_TRUSTED_ADDRESS_ACCOUNT_LEN,
        seeds = ["trusted_address".as_bytes(), &user_address.to_bytes(), &chain_id.to_le_bytes()],
        bump,
        constraint = authority.key() ==  user_address || authority.key() == client_account.user_address
    )]
    pub trusted_address: Box<Account<'info, ClientTrustedAddress>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct ClientTrustedAddressCreatedEvent {
    pub address: Pubkey,
    pub user_address: Pubkey,
    pub chain_id: u64,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, chain_id: u64)]
pub struct RemoveClientTrustedAddress<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    seeds = ["client".as_bytes(), &user_address.to_bytes()],
    bump = client_account.bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        mut,
        close = authority,
        seeds = ["trusted_address".as_bytes(), &user_address.to_bytes(), &chain_id.to_le_bytes()],
        bump = trusted_address.bump,
        constraint = authority.key() ==  user_address || authority.key() == client_account.user_address
    )]
    pub trusted_address: Box<Account<'info, ClientTrustedAddress>>,
}

#[event]
pub struct ClientTrustedAddressRemovedEvent {
    pub user_address: Pubkey,
    pub chain_id: u64,
}
