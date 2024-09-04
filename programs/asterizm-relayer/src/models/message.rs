use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;

use crate::asterizm_client::accounts::ClientTrustedAddress;
use crate::asterizm_client::program::AsterizmClient;
use crate::asterizm_initializer::accounts::InitializerSettings;
use crate::asterizm_initializer::program::AsterizmInitializer;
use crate::{asterizm_initializer, RelayerSettings};
use crate::{Chain, CustomRelayer};

#[derive(Accounts)]
#[instruction(relay_owner: Pubkey, dst_chain_id: u64)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    seeds = ["settings".as_bytes()], bump = settings_account.bump)]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(
    seeds = ["relay".as_bytes(), relay_owner.as_ref()],
    bump = relay_account.bump)]
    pub relay_account: Box<Account<'info, CustomRelayer>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside the instruction
    #[account(
        constraint = relay_account.owner == relay_account_owner.key()
    )]
    pub relay_account_owner: AccountInfo<'info>,
    #[account(
    seeds = ["chain".as_bytes(), &dst_chain_id.to_le_bytes()], bump = chain_account.bump)]
    pub chain_account: Box<Account<'info, Chain>>,
    pub system_program: Program<'info, System>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[event]
pub struct SendRelayerFee {
    pub relay_account_owner: Pubkey,
    pub fee: u64,
}

#[event]
pub struct SendMessageEvent {
    pub value: u64,
    pub payload: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TrSendMessageRequestDto {
    pub src_chain_id: u64,
    pub src_address: Pubkey,
    pub dst_chain_id: u64,
    pub dst_address: Pubkey,
    pub tx_id: u32,
    pub transfer_result_notify_flag: bool,
    pub transfer_hash: [u8; 32],
    pub relay_owner: Pubkey,
}

#[derive(Accounts)]
#[instruction(relay_owner: Pubkey, src_chain_id: u64)]
pub struct TransferMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump
    )]
    pub settings_account: Account<'info, RelayerSettings>,
    #[account(
        constraint = authority.key() == relay_account.owner,
        seeds = ["relay".as_bytes(), relay_owner.as_ref()],
        bump = relay_account.bump
    )]
    pub relay_account: Box<Account<'info, CustomRelayer>>,
    #[account(
        seeds = ["chain".as_bytes(), &src_chain_id.to_le_bytes()],
        bump = chain_account.bump
    )]
    pub chain_account: Box<Account<'info, Chain>>,
    pub initializer_program: Program<'info, AsterizmInitializer>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = initializer_settings_account.bump,
        seeds::program = initializer_program.key())
    ]
    pub initializer_settings_account: Account<'info, InitializerSettings>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we will check it in initializer
    #[account(mut)]
    pub dst_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in initializer
    #[account(mut)]
    pub transfer_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in initializer
    pub blocked_src_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in initializer
    pub blocked_dst_account: AccountInfo<'info>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it in client program
    pub client_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in client program
    pub trusted_address: Account<'info, ClientTrustedAddress>,
    /// CHECK: This is not dangerous because we will check it in client program
    #[account(mut)]
    pub client_transfer_account: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut TransferMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::InitTransfer<'info>>
{
    fn from(
        accounts: &mut TransferMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_initializer::cpi::accounts::InitTransfer<'info>>
    {
        let cpi_accounts = asterizm_initializer::cpi::accounts::InitTransfer {
            authority: accounts.authority.to_account_info(),
            settings_account: accounts.initializer_settings_account.to_account_info(),
            dst_account: accounts.dst_account.clone(),
            transfer_account: accounts.transfer_account.clone(),
            blocked_src_account: accounts.blocked_src_account.clone(),
            blocked_dst_account: accounts.blocked_dst_account.clone(),
            system_program: accounts.system_program.to_account_info(),
            client_program: accounts.client_program.to_account_info(),
            client_account: accounts.client_account.clone(),
            trusted_address: accounts.trusted_address.to_account_info(),
            client_transfer_account: accounts.client_transfer_account.clone(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.initializer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TrTransferMessageRequestDto {
    pub src_chain_id: u64,
    pub src_address: Pubkey,
    pub dst_chain_id: u64,
    pub dst_address: Pubkey,
    pub tx_id: u32,
    pub transfer_hash: [u8; 32],
    pub relay_owner: Pubkey,
}

#[event]
pub struct TransferSendEvent {
    pub src_chain_id: u64,
    pub src_address: Pubkey,
    pub dst_address: Pubkey,
    pub transfer_hash: [u8; 32],
}

#[derive(Accounts)]
#[instruction(_relay_owner: Pubkey)]
pub struct TransferSendingResultNotification<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        constraint = authority.key() == relay_account.owner,
        seeds = ["relay".as_bytes(), _relay_owner.as_ref()],
        bump = relay_account.bump
    )]
    pub relay_account: Box<Account<'info, CustomRelayer>>,
    pub initializer_program: Program<'info, AsterizmInitializer>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut crate::TransferSendingResultNotification<'info>>
    for CpiContext<
        'a,
        'b,
        'c,
        'info,
        asterizm_initializer::cpi::accounts::TransferSendingResult<'info>,
    >
{
    fn from(
        accounts: &mut TransferSendingResultNotification<'info>,
    ) -> CpiContext<
        'a,
        'b,
        'c,
        'info,
        asterizm_initializer::cpi::accounts::TransferSendingResult<'info>,
    > {
        let cpi_accounts = asterizm_initializer::cpi::accounts::TransferSendingResult {
            authority: accounts.authority.to_account_info(),
            client_program: accounts.client_program.to_account_info(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.initializer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
