use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;

use crate::asterizm_initializer::accounts::InitializerSettings;
use crate::asterizm_initializer::program::AsterizmInitializer;
use crate::asterizm_relayer::accounts::{Chain, RelayerSettings};
use crate::asterizm_relayer::program::AsterizmRelayer;
use crate::{
    asterizm_initializer, ClientAccount, ClientProgramSettings, ClientSender, ClientTrustedAddress,
};

pub const TRANSFER_ACCOUNT_LEN: usize =
  1                                       // success_receive
+ 1                                       // success_execute
+ 1                                       // refunded
+ 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct TransferAccount {
    pub success_receive: bool,
    pub success_execute: bool,
    pub refunded: bool,
    pub bump: u8,
}

#[event]
pub struct InitiateTransferEvent {
    pub dst_chain_id: u64,
    pub trusted_address: Pubkey,
    pub id: u128,
    pub transfer_hash: [u8; 32],
    pub payload: Vec<u8>,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, dst_chain_id: u64)]
pub struct InitSendMessage<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump,
    )]
    pub settings_account: Box<Account<'info, ClientProgramSettings>>,
    #[account(mut,
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["trusted_address".as_bytes(), &user_address.to_bytes(), &dst_chain_id.to_le_bytes()],
        bump = trusted_address.bump,
        constraint = authority.key() == user_address
    )]
    pub trusted_address: Box<Account<'info, ClientTrustedAddress>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will create it inside this instruction
    pub transfer_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    #[account(
        seeds = ["chain".as_bytes(), &dst_chain_id.to_le_bytes()],
        bump = chain_account.bump,
        seeds::program = relayer_program.key()
    )]
    pub chain_account: Box<Account<'info, Chain>>,
    pub relayer_program: Program<'info, AsterizmRelayer>,
}

#[derive(Debug)]
pub struct InitMessage {
    pub src_chain_id: u64,
    pub src_address: Pubkey,
    pub dst_chain_id: u64,
    pub dst_address: Pubkey,
    pub tx_id: u128,
    pub payload: Vec<u8>,
}

pub fn serialize_init_message_eth(message: InitMessage) -> Vec<u8> {
    let mut result = vec![];

    let mut word = [0u8; 112];
    word[0..8].copy_from_slice(&message.src_chain_id.to_be_bytes());
    word[8..40].copy_from_slice(&message.src_address.to_bytes());
    word[40..48].copy_from_slice(&message.dst_chain_id.to_be_bytes());
    word[48..80].copy_from_slice(&message.dst_address.to_bytes());
    word[(112 - 16)..112].copy_from_slice(&message.tx_id.to_be_bytes());

    result.extend_from_slice(&word);
    result.extend_from_slice(&message.payload);
    result
}

pub fn build_crosschain_hash(_packed: &[u8]) -> [u8; 32] {
    let static_chunk = &_packed[..112];
    let mut hash = solana_program::hash::hash(static_chunk);

    let payload_chunk = &_packed[112..];
    let payload_length = payload_chunk.len();
    let chunk_length = 127;

    let mut limit_fix = payload_length / chunk_length;
    if payload_length % chunk_length == 0 {
        limit_fix -= 1;
    }
    for i in 0..=limit_fix {
        let from = chunk_length * i;
        let to: usize = if from + chunk_length <= payload_length {
            from + chunk_length
        } else {
            payload_length
        };

        let chunk = &payload_chunk[from..to];
        let chunk_hash = solana_program::hash::hash(chunk);
        let encoded = [hash.to_bytes(), chunk_hash.to_bytes()].concat();
        hash = solana_program::hash::hash(&encoded);
    }

    hash.to_bytes()
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, dst_chain_id: u64, _tx_id: u128, transfer_hash: [u8; 32],)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["trusted_address".as_bytes(), &user_address.to_bytes(), &dst_chain_id.to_le_bytes()],
        bump = trusted_address.bump,
    )]
    pub trusted_address: Box<Account<'info, ClientTrustedAddress>>,
    #[account(
        seeds = ["sender".as_bytes(), &user_address.to_bytes(), &sender.address.to_bytes()],
        bump = sender.bump,
        constraint = authority.key() == sender.address
    )]
    pub sender: Box<Account<'info, ClientSender>>,
    #[account(
        mut,
        seeds = ["outgoing_transfer".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump = transfer_account.bump,
        constraint = !transfer_account.success_execute && !transfer_account.refunded
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub initializer_settings_account: Account<'info, InitializerSettings>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub relayer_settings_account: Account<'info, RelayerSettings>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    #[account(mut)]
    pub system_relay_account_owner: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relay_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    #[account(mut)]
    pub relay_account_owner: Option<AccountInfo<'info>>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub chain_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relayer_program: Program<'info, AsterizmRelayer>,
    pub initializer_program: Program<'info, AsterizmInitializer>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub blocked_src_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub blocked_dst_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub initializer_transfer_account: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut SendMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::SendMessage<'info>>
{
    fn from(
        accounts: &mut SendMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::SendMessage<'info>>
    {
        let cpi_accounts = asterizm_initializer::cpi::accounts::SendMessage {
            authority: accounts.authority.to_account_info(),
            settings_account: accounts.initializer_settings_account.to_account_info(),
            relayer_settings_account: accounts.relayer_settings_account.to_account_info(),
            relay_account_owner: accounts.relay_account_owner.clone(),
            relay_account: accounts.relay_account.clone(),
            chain_account: accounts.chain_account.clone(),
            relayer_program: accounts.relayer_program.to_account_info(),
            system_program: accounts.system_program.to_account_info(),
            blocked_src_account: accounts.blocked_src_account.clone(),
            blocked_dst_account: accounts.blocked_dst_account.clone(),
            system_relay_account_owner: accounts.system_relay_account_owner.clone(),
            transfer_account: accounts.initializer_transfer_account.clone(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.initializer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, transfer_hash: [u8; 32])]
pub struct ResendMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["sender".as_bytes(), &user_address.to_bytes(), &sender.address.to_bytes()],
        bump = sender.bump,
        constraint = authority.key() == sender.address
    )]
    pub sender: Box<Account<'info, ClientSender>>,
    #[account(
        seeds = ["outgoing_transfer".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump = transfer_account.bump,
        constraint = transfer_account.success_execute && !transfer_account.refunded
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub initializer_settings_account: Account<'info, InitializerSettings>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub relayer_settings_account: Account<'info, RelayerSettings>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    #[account(mut)]
    pub system_relay_account_owner: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relay_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    #[account(mut)]
    pub relay_account_owner: Option<AccountInfo<'info>>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relayer_program: Program<'info, AsterizmRelayer>,
    pub initializer_program: Program<'info, AsterizmInitializer>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in initializer
    pub initializer_transfer_account: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut ResendMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::ResendMessage<'info>>
{
    fn from(
        accounts: &mut ResendMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::ResendMessage<'info>>
    {
        let cpi_accounts = asterizm_initializer::cpi::accounts::ResendMessage {
            authority: accounts.authority.to_account_info(),
            settings_account: accounts.initializer_settings_account.to_account_info(),
            relayer_settings_account: accounts.relayer_settings_account.to_account_info(),
            relay_account_owner: accounts.relay_account_owner.clone(),
            relay_account: accounts.relay_account.clone(),
            relayer_program: accounts.relayer_program.to_account_info(),
            system_program: accounts.system_program.to_account_info(),
            system_relay_account_owner: accounts.system_relay_account_owner.clone(),
            transfer_account: accounts.initializer_transfer_account.clone(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.initializer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
#[instruction(dst_address: Pubkey, src_address: Pubkey, src_chain_id: u64, _tx_id: u128, transfer_hash: [u8; 32],)]
pub struct InitReceiveMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &dst_address.to_bytes()],
        bump = client_account.bump,
        constraint = authority.key() == client_account.relay_owner
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will create it inside this instruction
    pub transfer_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[event]
pub struct PayloadReceivedEvent {
    pub src_chain_id: u64,
    pub src_address: Pubkey,
    pub tx_id: u128,
    pub transfer_hash: [u8; 32],
}

#[derive(Accounts)]
#[instruction(_dst_address: Pubkey, _tx_id: u128, src_chain_id: u64, src_address: Pubkey, transfer_hash: [u8; 32],)]
pub struct ReceiveMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump,
    )]
    pub settings_account: Box<Account<'info, ClientProgramSettings>>,
    #[account(
        seeds = ["client".as_bytes(), &_dst_address.to_bytes()],
        bump = client_account.bump,
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["sender".as_bytes(), &_dst_address.to_bytes(), &sender.address.to_bytes()],
        bump = sender.bump,
        constraint = authority.key() == sender.address
    )]
    pub sender: Box<Account<'info, ClientSender>>,
    #[account(
        seeds = ["trusted_address".as_bytes(), &_dst_address.to_bytes(), &src_chain_id.to_le_bytes()],
        bump = trusted_address.bump,
        constraint = trusted_address.address == src_address
    )]
    pub trusted_address: Box<Account<'info, ClientTrustedAddress>>,
    #[account(
        seeds = ["incoming_transfer".as_bytes(), &_dst_address.to_bytes(), &transfer_hash],
        bump = transfer_account.bump,
        constraint = !transfer_account.success_execute && !transfer_account.refunded
    )]
    pub transfer_account: Account<'info, TransferAccount>,
    #[account(
        seeds = ["chain".as_bytes(), &src_chain_id.to_le_bytes()],
        bump = chain_account.bump,
        seeds::program = relayer_program.key()
    )]
    pub chain_account: Box<Account<'info, Chain>>,
    pub relayer_program: Program<'info, AsterizmRelayer>,
}

#[derive(Accounts)]
#[instruction(dst_address: Pubkey)]
pub struct TransferSendingResult<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = ["client".as_bytes(), &dst_address.to_bytes()],
        bump = client_account.bump,
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[event]
pub struct TransferSendingResultEvent {
    pub dst_address: Pubkey,
    pub transfer_hash: [u8; 32],
    pub status_code: u8,
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    #[test]
    pub fn check_hash() {
        // let message = InitMessage {
        //     src_chain_id: 0x1111111111111111,
        //     src_address: Pubkey::from_str("3JF3sEqM796hk5WFqA6EtmEwJQ9quALszsfJyvXNQKy3").unwrap(),
        //     dst_chain_id: 0x3333333333333333,
        //     dst_address: Pubkey::from_str("5bV6jUfhDHCQVA1WfKBUnXUsboJgoKgkzkKcxr3joew5").unwrap(),
        //     tx_id: 0x55555555555555555555555555555555,
        //     payload: hex::decode("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA").unwrap(),
        // };

        // let buffer = serialize_init_message_eth(message);
        // println!("buffer = 0x{}", hex::encode(&buffer));
        // // let buffer = [0xaa; 127];

        // let hash = build_crosschain_hash(&buffer);
        // println!("build_crosschain_hash = 0x{}", hex::encode(hash));

        // let message = InitMessage {
        //     src_chain_id: 0x1111111111111111,
        //     src_address: Pubkey::from_str("3JF3sEqM796hk5WFqA6EtmEwJQ9quALszsfJyvXNQKy3").unwrap(),
        //     dst_chain_id: 0x3333333333333333,
        //     dst_address: Pubkey::from_str("5bV6jUfhDHCQVA1WfKBUnXUsboJgoKgkzkKcxr3joew5").unwrap(),
        //     tx_id: 0x55555555555555555555555555555555,
        //     payload: hex::decode("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB").unwrap(),
        // };

        // let buffer = serialize_init_message_eth(message);
        // println!("buffer = 0x{}", hex::encode(&buffer));

        // let hash = build_crosschain_hash(&buffer);
        // println!("build_crosschain_hash = 0x{}", hex::encode(hash));

        let message = InitMessage {
            src_chain_id: 70001,
            src_address: Pubkey::from_str("B4XJw6UJbTtPcEd9HyVBbVq23EbdQvA4criqyVyGdxGB").unwrap(),
            dst_chain_id: 97,
            dst_address: Pubkey::from_str("1111111111113C6WPEahzkMeBwLPZ487yfoPkDTz").unwrap(),
            tx_id: 6,
            payload: hex::decode("0000000000000000000000009f3e4bcac4fe2f444648c024e6e75360cd41c544000000000000000000000000000000000000000000000000000000003b9aca000000000000000000000000000000000000000000000000000000000000000006").unwrap(),
        };

        let buffer = serialize_init_message_eth(message);
        println!("buffer = 0x{}", hex::encode(&buffer));

        let hash = solana_program::hash::hash(&buffer);
        println!("regular hash = 0x{}", hex::encode(hash));

        let hash = build_crosschain_hash(&buffer);
        println!("build_crosschain_hash = 0x{}", hex::encode(hash));

        // let buffer = [0xbb; 126];
        // println!(
        // "buffer = 0x{}, len = {}",
        // hex::encode(&buffer),
        // buffer.len()
        // );

        // let hash = build_crosschain_hash(&buffer);
        // println!("build_crosschain_hash = 0x{}", hex::encode(hash));

        // let hash = solana_program::hash::hash(&buffer);
        // println!("regular hash = 0x{}", hex::encode(hash));

        // let data = base64::decode("ao2ZtXt6GeRBnAAAAAAAALdn4pW3r+OJESL8qODD9WNrQ4tv6v55oXrRLLMsxqG5IQAAAAAAAAAAAAAAAAAAAADFfmyycLG6PxioflC9vAUilqUg//XNqZ4ogJaFNIVLYAAAABxEo4c/F0WduPlrA7fyDIatCHubreAYL7P0iORp6iXxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLQXgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIQ==").unwrap();
        // println!("data = 0x{}", hex::encode(&data));
        // let event = InitiateTransferEvent::try_from_slice(&data[8..]).unwrap();
        // println!("hash event = 0x{}", hex::encode(event.transfer_hash));
    }
}
