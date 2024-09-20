use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;

use crate::asterizm_client::program::AsterizmClient;
use crate::asterizm_relayer::accounts::RelayerSettings;
use crate::asterizm_relayer::program::AsterizmRelayer;
use crate::{asterizm_client, asterizm_relayer, InitializerSettings};

pub const TRANSFER_ACCOUNT_LEN: usize = 1 // exists
;

#[account]
#[derive(Default)]
pub struct TransferAccount {
    pub exists: bool,
}

#[event]
pub struct OutgoingEvent {
    pub address: Pubkey,
    pub transfer_hash: [u8; 32],
}

#[derive(Accounts)]
#[instruction(relay_owner: Pubkey, dst_chain_id: u64, src_address: Pubkey, dst_address: Pubkey, _tx_id: u128, transfer_hash: [u8; 32])]
pub struct InitSendMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump
    )]
    pub settings_account: Account<'info, InitializerSettings>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = relayer_settings_account.bump,
        seeds::program = relayer_program.key())
    ]
    pub relayer_settings_account: Account<'info, RelayerSettings>,
    /// CHECK: This is not dangerous because we will check it in constraint
    #[account(mut,
        constraint = relayer_settings_account.system_relayer_owner == system_relay_account_owner.key()
    )]
    pub system_relay_account_owner: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relay_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    #[account(mut)]
    pub relay_account_owner: Option<AccountInfo<'info>>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub chain_account: AccountInfo<'info>,
    pub relayer_program: Program<'info, AsterizmRelayer>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = blocked_src_account.lamports() == 0,
        seeds = ["blocked".as_bytes(), &settings_account.local_chain_id.to_le_bytes(), &src_address.to_bytes()],
        bump,
    )]
    /// CHECK: This is not dangerous because we will check it in constraint
    pub blocked_src_account: AccountInfo<'info>,
    #[account(
        constraint = blocked_dst_account.lamports() == 0,
        seeds = ["blocked".as_bytes(), &dst_chain_id.to_le_bytes(), &dst_address.to_bytes()],
        bump,
    )]
    /// CHECK: This is not dangerous because we will check it in constraint
    pub blocked_dst_account: AccountInfo<'info>,
    #[account(init, payer = authority,
    space = 8 + TRANSFER_ACCOUNT_LEN,
    seeds = ["outgoing_transfer".as_bytes(), &src_address.to_bytes(), &transfer_hash], bump)]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> InitSendMessage<'info> {
    pub fn to_send_message(
        &self,
        relay_account_owner: AccountInfo<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_relayer::cpi::accounts::SendMessage<'info>> {
        let cpi_accounts = asterizm_relayer::cpi::accounts::SendMessage {
            authority: self.authority.to_account_info(),
            settings_account: self.relayer_settings_account.to_account_info(),
            relay_account_owner,
            relay_account: self.relay_account.clone(),
            chain_account: self.chain_account.clone(),
            system_program: self.system_program.to_account_info(),
            instruction_sysvar_account: self.instruction_sysvar_account.clone(),
        };
        let cpi_program = self.relayer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}



#[derive(Accounts)]
#[instruction(relay_owner: Pubkey, src_address: Pubkey, transfer_hash: [u8; 32])]
pub struct ResendMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump
    )]
    pub settings_account: Account<'info, InitializerSettings>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = relayer_settings_account.bump,
        seeds::program = relayer_program.key())
    ]
    pub relayer_settings_account: Account<'info, RelayerSettings>,
    /// CHECK: This is not dangerous because we will check it in constraint
    #[account(mut,
        constraint = relayer_settings_account.system_relayer_owner == system_relay_account_owner.key()
    )]
    pub system_relay_account_owner: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    pub relay_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside the instruction in relayer
    #[account(mut)]
    pub relay_account_owner: Option<AccountInfo<'info>>,
    pub relayer_program: Program<'info, AsterizmRelayer>,
    pub system_program: Program<'info, System>,
    #[account(
    seeds = ["outgoing_transfer".as_bytes(), &src_address.to_bytes(), &transfer_hash], 
    bump,
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> ResendMessage<'info> {
    pub fn to_send_message(
        &self,
        relay_account_owner: AccountInfo<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_relayer::cpi::accounts::ResendMessage<'info>> {
        let cpi_accounts = asterizm_relayer::cpi::accounts::ResendMessage {
            authority: self.authority.to_account_info(),
            settings_account: self.relayer_settings_account.to_account_info(),
            relay_account_owner,
            relay_account: self.relay_account.clone(),
            system_program: self.system_program.to_account_info(),
            instruction_sysvar_account: self.instruction_sysvar_account.clone(),
        };
        let cpi_program = self.relayer_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[event]
pub struct IncomingEvent {
    pub address: Pubkey,
    pub transfer_hash: [u8; 32],
}

#[derive(Accounts)]
#[instruction(dst_address: Pubkey, src_address: Pubkey, src_chain_id: u64, _tx_id: u128, transfer_hash: [u8; 32],)]
pub struct InitTransferMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["settings".as_bytes()],
        bump = settings_account.bump
    )]
    pub settings_account: Account<'info, InitializerSettings>,
    #[account(
        constraint = dst_account.key() == dst_address
    )]
    /// CHECK: This is not dangerous because we will check it in constraint
    #[account(mut)]
    pub dst_account: AccountInfo<'info>,
    #[account(init,
        payer = authority,
        space = 8 + TRANSFER_ACCOUNT_LEN,
        seeds = ["incoming_transfer".as_bytes(), &dst_address.to_bytes(), &transfer_hash],
        bump
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    #[account(
        constraint = blocked_src_account.lamports() == 0,
        seeds = ["blocked".as_bytes(), &src_chain_id.to_le_bytes(), &src_address.to_bytes()],
        bump,
    )]
    /// CHECK: This is not dangerous because we will check it in constraint
    pub blocked_src_account: AccountInfo<'info>,
    #[account(
        constraint = blocked_dst_account.lamports() == 0,
        seeds = ["blocked".as_bytes(), &settings_account.local_chain_id.to_le_bytes(), &dst_address.to_bytes()],
        bump,
    )]
    /// CHECK: This is not dangerous because we will check it in constraint
    pub blocked_dst_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it in client program
    pub client_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in client program
    pub trusted_address: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it in client program
    #[account(mut)]
    pub client_transfer_account: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut InitTransferMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitReceiveMessage<'info>>
{
    fn from(
        accounts: &mut InitTransferMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitReceiveMessage<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::InitReceiveMessage {
            authority: accounts.authority.to_account_info(),
            client_account: accounts.client_account.clone(),
            trusted_address: accounts.trusted_address.clone(),
            transfer_account: accounts.client_transfer_account.clone(),
            system_program: accounts.system_program.to_account_info(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct TransferSendingResultInitializer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it in client program
    pub client_account: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut crate::TransferSendingResultInitializer<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::TransferSendingResult<'info>>
{
    fn from(
        accounts: &mut TransferSendingResultInitializer<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::TransferSendingResult<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::TransferSendingResult {
            authority: accounts.authority.to_account_info(),
            client_account: accounts.client_account.clone(),
            instruction_sysvar_account: accounts.instruction_sysvar_account.clone(),
        };
        let cpi_program = accounts.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
