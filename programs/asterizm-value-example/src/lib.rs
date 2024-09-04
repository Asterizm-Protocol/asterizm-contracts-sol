use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;

declare_id!("AsWKK9AMhadUi2GX7BptSCqyhLJBeCXoKbytoF28AuKR");

declare_program!(asterizm_client);

use crate::asterizm_client::accounts::{ClientAccount, ClientTrustedAddress};
use crate::asterizm_client::program::AsterizmClient;

#[program]
pub mod asterizm_value_example {
    use super::*;

    pub fn send_message(
        ctx: Context<SendMessage>,
        amount: u64,
        dst_address: Pubkey,
        dst_chain_id: u64,
    ) -> Result<()> {
        let tx_id = ctx.accounts.value_client_account.tx_id;

        let payload = serialize_message_payload_eth(MessagePayload {
            dst_address,
            amount,
            tx_id,
        });

        asterizm_client::cpi::init_send_message(
            ctx.accounts.into(),
            ctx.accounts.authority.key(),
            dst_chain_id,
            payload,
            tx_id,
        )?;

        ctx.accounts.value_client_account.tx_id += 1;

        Ok(())
    }

    pub fn receive_message(
        ctx: Context<ReceiveMessage>,
        transfer_hash: [u8; 32],
        src_chain_id: u64,
        src_address: Pubkey,
        tx_id: u32,
        payload: Vec<u8>,
    ) -> Result<()> {
        let data = deserialize_message_payload_eth(&payload)?;

        asterizm_client::cpi::receive_message(
            ctx.accounts.into(),
            ctx.accounts.authority.key(),
            tx_id,
            src_chain_id,
            src_address,
            transfer_hash,
            payload,
        )?;

        msg!("data - {:?}", data);

        Ok(())
    }

    pub fn create_value_client(ctx: Context<CreateValueClient>) -> Result<()> {
        ctx.accounts.value_client_account.is_initialized = true;
        ctx.accounts.value_client_account.tx_id = 0;
        ctx.accounts.value_client_account.bump = ctx.bumps.value_client_account;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: only used as a signing PDA
    pub authority: UncheckedAccount<'info>,
    #[account(mut,
        seeds = [authority.key().as_ref(), b"asterizm-value-client"],
        bump = value_client_account.bump,
    )]
    pub value_client_account: Box<Account<'info, ValueClientAccount>>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_settings_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: Box<Account<'info, ClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub trusted_address: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub transfer_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub chain_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub relayer_program: AccountInfo<'info>,
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Default, Debug)]
pub struct MessagePayload {
    pub dst_address: Pubkey,
    pub amount: u64,
    pub tx_id: u32,
}

pub fn serialize_message_payload_eth(message: MessagePayload) -> Vec<u8> {
    let mut word = [0u8; 96];
    word[..32].copy_from_slice(&message.dst_address.to_bytes());
    word[(64 - 8)..64].copy_from_slice(&message.amount.to_be_bytes());
    word[(96 - 4)..96].copy_from_slice(&message.tx_id.to_be_bytes());
    word.to_vec()
}

pub fn deserialize_message_payload_eth(payload: &[u8]) -> Result<MessagePayload> {
    let dst_address = Pubkey::try_from_slice(&payload[..32])?;
    let mut arr = [0u8; 8];
    arr.copy_from_slice(&payload[(64 - 8)..64]);
    let amount = u64::from_be_bytes(arr);

    let mut arr = [0u8; 4];
    arr.copy_from_slice(&payload[(96 - 4)..96]);
    let tx_id = u32::from_be_bytes(arr);

    Ok(MessagePayload {
        dst_address,
        amount,
        tx_id,
    })
}

#[derive(Accounts)]
pub struct ReceiveMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_settings_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub transfer_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_trusted_address: Box<Account<'info, ClientTrustedAddress>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_sender: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub chain_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub relayer_program: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> From<&mut SendMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitSendMessage<'info>>
{
    fn from(
        accounts: &mut SendMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitSendMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::InitSendMessage {
            signer: accounts.signer.to_account_info(),
            authority: accounts.signer.to_account_info(),
            settings_account: accounts.client_settings_account.to_account_info(),
            client_account: accounts.client_account.to_account_info(),
            trusted_address: accounts.trusted_address.clone(),
            transfer_account: accounts.transfer_account.clone(),
            rent: accounts.rent.to_account_info(),
            system_program: accounts.system_program.to_account_info(),
            chain_account: accounts.chain_account.clone(),
            relayer_program: accounts.relayer_program.to_account_info(),
        };
        let cpi_program = accounts.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'a, 'b, 'c, 'info> From<&mut ReceiveMessage<'info>>
    for CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::ReceiveMessage<'info>>
{
    fn from(
        accounts: &mut ReceiveMessage<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::ReceiveMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::ReceiveMessage {
            authority: accounts.authority.to_account_info(),
            settings_account: accounts.client_settings_account.to_account_info(),
            client_account: accounts.client_account.to_account_info(),
            sender: accounts.client_sender.to_account_info(),
            trusted_address: accounts.client_trusted_address.to_account_info(),
            transfer_account: accounts.transfer_account.clone(),
            chain_account: accounts.chain_account.clone(),
            relayer_program: accounts.relayer_program.to_account_info(),
        };
        let cpi_program = accounts.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub const VALUE_CLIENT_ACCOUNT_LEN: usize = 1 // is is_initialized
    + 32                                      // tx_id
    + 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct ValueClientAccount {
    pub is_initialized: bool,
    pub tx_id: u32,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateValueClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + VALUE_CLIENT_ACCOUNT_LEN,
        seeds = [authority.key().as_ref(), b"asterizm-value-client"],
        bump
    )]
    pub value_client_account: Box<Account<'info, ValueClientAccount>>,
    pub system_program: Program<'info, System>,
}
