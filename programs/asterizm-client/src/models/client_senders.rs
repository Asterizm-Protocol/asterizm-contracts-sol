use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;

use crate::ClientAccount;

pub const CLIENT_SENDER_ACCOUNT_LEN: usize = 1 // is is_initialized
+ PUBKEY_BYTES                            // user_address
+ PUBKEY_BYTES                            // address
+ 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct ClientSender {
    pub is_initialized: bool,
    pub user_address: Pubkey,
    pub address: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, address: Pubkey)]
pub struct CreateClientSender<'info> {
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
        space = 8 + CLIENT_SENDER_ACCOUNT_LEN,
        seeds = ["sender".as_bytes(), &user_address.to_bytes(), &address.to_bytes()],
        bump,
        constraint = authority.key() ==  user_address || authority.key() == client_account.user_address
    )]
    pub sender: Box<Account<'info, ClientSender>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct ClientSenderCreatedEvent {
    pub address: Pubkey,
    pub user_address: Pubkey,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, address: Pubkey)]
pub struct RemoveClientSender<'info> {
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
        seeds = ["sender".as_bytes(), &user_address.to_bytes(), &address.to_bytes()],
        bump = sender.bump,
        constraint = authority.key() ==  user_address || authority.key() == client_account.user_address
    )]
    pub sender: Box<Account<'info, ClientSender>>,
}

#[event]
pub struct ClientSenderRemovedEvent {
    pub address: Pubkey,
    pub user_address: Pubkey,
}
