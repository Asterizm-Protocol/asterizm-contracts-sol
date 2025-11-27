use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::*;
use mpl_token_metadata::{
    instructions::CreateV1CpiBuilder,
    types::TokenStandard,
};

declare_id!("ASWxijC9aT8vjBHm91AED6BjEEeZC5oSRVXwcSTgkd3s");

declare_program!(asterizm_client);

use crate::asterizm_client::accounts::{ClientAccount, ClientTrustedAddress, TransferAccount};
use crate::asterizm_client::program::AsterizmClient;

#[program]
mod asterizm_token_example {
    use super::*;
    use anchor_lang::system_program::{transfer, Transfer};

    pub fn send_message(
        ctx: Context<SendMessage>,
        _name: String,
        transfer_hash: [u8; 32],
        amount: u64,
        dst_address: Pubkey,
        dst_chain_id: u64,
    ) -> Result<()> {
        // Calculate fees
        let owner_fee = (amount * ctx.accounts.token_client_account.owner_fee_rate) / 10000;
        let system_fee = (amount * ctx.accounts.token_client_account.system_fee_rate) / 10000;
        let total_fees = owner_fee.saturating_add(system_fee);
        if total_fees >= amount {
            return Err(ProgramError::InvalidInstructionData.into());
        }
        let actual_amount = amount - total_fees;

        // transfer SOL fee to token authority
        let fee = ctx.accounts.token_client_account.fee;
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: ctx.accounts.token_authority.clone(),
            },
        );
        transfer(cpi_context, fee)?;

        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        // Burn all amount
        burn(ctx.accounts.to_burn_cpi(signer), amount)?;

        // Mint fees to token authority and system
        if owner_fee > 0 {
            mint_to(ctx.accounts.to_mint_owner(signer), owner_fee)?;
        }
        if system_fee > 0 {
            mint_to(ctx.accounts.to_mint_system(signer), system_fee)?;
        }

        let tx_id = ctx.accounts.token_client_account.tx_id;

        let payload = serialize_message_payload_eth(MessagePayload {
            dst_address,
            amount: actual_amount,
            tx_id,
        });

        asterizm_client::cpi::init_send_message(
            ctx.accounts.to_send_message_cpi(signer),
            ctx.accounts.token_client_account.key(),
            dst_chain_id,
            payload,
            tx_id,
        )?;

        ctx.accounts.token_client_account.tx_id += 1;

        ctx.accounts.refund_transfer_account.is_initialized = true;
        ctx.accounts.refund_transfer_account.amount = actual_amount;
        ctx.accounts.refund_transfer_account.user_address = ctx.accounts.signer.key();
        ctx.accounts.refund_transfer_account.token_address = ctx.accounts.from.key();
        ctx.accounts.refund_transfer_account.bump = ctx.bumps.refund_transfer_account;

        emit!(AddTransferEvent {
            transfer_hash,
            amount: actual_amount,
            user_address: ctx.accounts.signer.key(),
            token_address: ctx.accounts.from.key(),
        });

        Ok(())
    }

    pub fn receive_message(
        ctx: Context<ReceiveMessage>,
        _name: String,
        transfer_hash: [u8; 32],
        src_chain_id: u64,
        src_address: Pubkey,
        tx_id: u128,
        payload: Vec<u8>,
    ) -> Result<()> {
        let data = deserialize_message_payload_eth(&payload)?;

        if data.dst_address != ctx.accounts.to.key() {
            return Err(ProgramError::InvalidAccountOwner.into());
        }

        asterizm_client::cpi::receive_message(
            ctx.accounts.to_receive_message_cpi(),
            ctx.accounts.token_client_account.key(),
            tx_id,
            src_chain_id,
            src_address,
            transfer_hash,
            payload,
        )?;

        // Calculate fees on received amount
        let owner_fee = (data.amount * ctx.accounts.token_client_account.owner_fee_rate) / 10000;
        let system_fee = (data.amount * ctx.accounts.token_client_account.system_fee_rate) / 10000;
        let actual_mint_amount = data.amount.saturating_sub(owner_fee).saturating_sub(system_fee);

        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        // Mint actual amount to recipient
        if actual_mint_amount > 0 {
            mint_to(ctx.accounts.to_mint_cpi(signer), actual_mint_amount)?;
        }

        // Distribute fees
        if owner_fee > 0 {
            mint_to(ctx.accounts.to_mint_owner(signer), owner_fee)?;
        }
        if system_fee > 0 {
            mint_to(ctx.accounts.to_mint_system(signer), system_fee)?;
        }

        Ok(())
    }

    pub fn add_refund_request(
        ctx: Context<AddRefundRequest>,
        _name: String,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::add_refund_request(
            ctx.accounts.to_add_refund_request(signer),
            ctx.accounts.token_client_account.key(),
            transfer_hash,
        )?;

        Ok(())
    }

    pub fn process_refund_request(
        ctx: Context<ProcessRefundRequest>,
        _name: String,
        transfer_hash: [u8; 32],
        status: bool,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::process_refund_request(
            ctx.accounts.to_process_refund_request(signer),
            ctx.accounts.token_client_account.key(),
            transfer_hash,
            status,
        )?;

        if status {
            // transfer refund fee to token authority
            let refund_fee = ctx.accounts.token_client_account.refund_fee;
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.token_authority.clone(),
                },
            );
            transfer(cpi_context, refund_fee)?;

            mint_to(
                ctx.accounts.to_mint_cpi(signer),
                ctx.accounts.refund_transfer_account.amount,
            )?;
        }

        Ok(())
    }

    pub fn mint_to_user(ctx: Context<MintToUser>, name: String, amount: u64) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        mint_to(ctx.accounts.to_mint_cpi(signer), amount)
    }

    pub fn create_mint(
        ctx: Context<CreateMint>,
        _name: String,
        _decimals: u8,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
        refund_enabled: bool,
        fee: u64,
        refund_fee: u64,
        owner_fee_rate: u64,
        system_fee_rate: u64,
        system_fee_address: Pubkey,
    ) -> Result<()> {
        ctx.accounts.token_client_account.is_initialized = true;
        ctx.accounts.token_client_account.tx_id = 0;
        ctx.accounts.token_client_account.fee = fee;
        ctx.accounts.token_client_account.refund_fee = refund_fee;
        ctx.accounts.token_client_account.owner_fee_rate = owner_fee_rate;
        ctx.accounts.token_client_account.system_fee_rate = system_fee_rate;
        ctx.accounts.token_client_account.system_fee_address = system_fee_address;
        ctx.accounts.token_client_account.authority = ctx.accounts.authority.key();
        ctx.accounts.token_client_account.bump = ctx.bumps.token_client_account;

        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client(
            ctx.accounts.to_create_client_cpi(signer),
            ctx.accounts.token_client_account.key(),
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
            refund_enabled,
        )?;

        Ok(())
    }

    pub fn update_client_params(
        ctx: Context<UpdateClientParams>,
        _name: String,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
        refund_enabled: bool,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::update_client(
            ctx.accounts.to_update_client_cpi(signer),
            ctx.accounts.token_client_account.key(),
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
            refund_enabled,
        )?;

        Ok(())
    }

    pub fn update_fee(
        ctx: Context<UpdateFee>,
        _name: String,
        fee: u64,
        refund_fee: u64,
    ) -> Result<()> {
        ctx.accounts.token_client_account.fee = fee;
        ctx.accounts.token_client_account.refund_fee = refund_fee;
        Ok(())
    }

    pub fn create_client_trusted_address(
        ctx: Context<CreateClientTrustedAddress>,
        _name: String,
        chain_id: u64,
        address: Pubkey,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client_trusted_address(
            ctx.accounts.to_create_client_trusted_address_cpi(signer),
            ctx.accounts.token_client_account.key(),
            chain_id,
            address,
        )?;

        Ok(())
    }
    pub fn remove_client_trusted_address(
        ctx: Context<RemoveClientTrustedAddress>,
        _name: String,
        chain_id: u64,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::remove_client_trusted_address(
            ctx.accounts.to_remove_client_trusted_address_cpi(signer),
            ctx.accounts.token_client_account.key(),
            chain_id,
        )?;

        Ok(())
    }

    pub fn create_client_sender(
        ctx: Context<CreateClientSender>,
        _name: String,
        address: Pubkey,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client_sender(
            ctx.accounts.to_create_client_sender_cpi(signer),
            ctx.accounts.token_client_account.key(),
            address,
        )?;

        Ok(())
    }
    pub fn remove_client_sender(
        ctx: Context<RemoveClientSender>,
        _name: String,
        address: Pubkey,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::remove_client_sender(
            ctx.accounts.to_remove_client_sender_cpi(signer),
            ctx.accounts.token_client_account.key(),
            address,
        )?;

        Ok(())
    }

    pub fn add_meta(
        ctx: Context<AddMeta>,
        _token_name: String,
        mint_bump: u8,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let token_client_seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _token_name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let mint_seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _token_name.as_bytes(),
            b"asterizm-token-mint",
            &[mint_bump],
        ];
        let signer: &[&[&[u8]]] = &[&token_client_seeds[..], &mint_seeds[..]];

        CreateV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .metadata(&ctx.accounts.token_metadata.to_account_info())
            .mint(&ctx.accounts.mint.to_account_info(), true)
            .decimals(ctx.accounts.mint.decimals)
            .authority(&ctx.accounts.token_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .update_authority(&ctx.accounts.token_client_account.to_account_info(), false)
            .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
            .name(name)
            .symbol(symbol)
            .uri(uri)
            .seller_fee_basis_points(0)
            .token_standard(TokenStandard::Fungible)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .invoke_signed(&signer)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_name: String, transfer_hash: [u8; 32],)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside mint and token_client_account
    pub token_authority: AccountInfo<'info>,
    #[account(mut,
        seeds = [&token_authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-mint"],
        bump
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = signer,
    )]
    pub from: Account<'info, TokenAccount>,
    #[account(mut,
        seeds = [&token_authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    #[account(
        init,
        payer = signer,
        space = 8 + REFUND_TRANSFER_ACCOUNT_LEN,
        seeds = [token_authority.key().as_ref(), &transfer_hash, b"refund-transfer"],
        bump
    )]
    pub refund_transfer_account: Box<Account<'info, RefundTransferAccount>>,
    pub token_program: Program<'info, Token>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_settings_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: Box<Account<'info, ClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub trusted_address: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub transfer_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub chain_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub relayer_program: AccountInfo<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_client_account.authority,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_client_account.system_fee_address,
    )]
    pub system_fee_token_account: Account<'info, TokenAccount>,
}

#[event]
pub struct AddTransferEvent {
    pub transfer_hash: [u8; 32],
    pub user_address: Pubkey,
    pub amount: u64,
    pub token_address: Pubkey,
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Default, Debug)]
pub struct MessagePayload {
    pub dst_address: Pubkey,
    pub amount: u64,
    pub tx_id: u128,
}

pub fn serialize_message_payload_eth(message: MessagePayload) -> Vec<u8> {
    let mut word = [0u8; 96];
    word[..32].copy_from_slice(&message.dst_address.to_bytes());
    word[(64 - 8)..64].copy_from_slice(&message.amount.to_be_bytes());
    word[(96 - 16)..96].copy_from_slice(&message.tx_id.to_be_bytes());
    word.to_vec()
}

pub fn deserialize_message_payload_eth(payload: &[u8]) -> Result<MessagePayload> {
    let dst_address = Pubkey::try_from_slice(&payload[..32])?;
    let mut arr = [0u8; 8];
    arr.copy_from_slice(&payload[(64 - 8)..64]);
    let amount = u64::from_be_bytes(arr);

    let mut arr = [0u8; 16];
    arr.copy_from_slice(&payload[(96 - 16)..96]);
    let tx_id = u128::from_be_bytes(arr);

    Ok(MessagePayload {
        dst_address,
        amount,
        tx_id,
    })
}

pub const REFUND_TRANSFER_ACCOUNT_LEN: usize = 1    // is is_initialized
    + PUBKEY_BYTES                                  // user_address
    + 64                                            // amount
    + PUBKEY_BYTES                                  // token_address
    + 1                                             // bump
;

#[account]
#[derive(Default)]
pub struct RefundTransferAccount {
    pub is_initialized: bool,
    pub user_address: Pubkey,
    pub amount: u64,
    pub token_address: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(_name: String, _transfer_hash: [u8; 32],)]
pub struct AddRefundRequest<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside mint and token_client_account
    pub token_authority: AccountInfo<'info>,
    #[account(mut,
        seeds = [&token_authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    pub client_program: Program<'info, AsterizmClient>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(mut,
        seeds = ["outgoing_transfer".as_bytes(), &token_client_account.key().as_ref(), &_transfer_hash],
        bump = transfer_account.bump,
        seeds::program = client_program.key()
    )]
    pub transfer_account: Account<'info, TransferAccount>,
    #[account(
        seeds = [token_authority.key().as_ref(), &_transfer_hash, b"refund-transfer"],
        bump = refund_transfer_account.bump,
        constraint = refund_transfer_account.user_address == signer.key()
    )]
    pub refund_transfer_account: Box<Account<'info, RefundTransferAccount>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_refund_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_name: String, transfer_hash: [u8; 32],)]
pub struct ProcessRefundRequest<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside mint and token_client_account
    pub token_authority: AccountInfo<'info>,
    #[account(mut,
        seeds = [&token_authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub to: AccountInfo<'info>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = to,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub client_program: Program<'info, AsterizmClient>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(mut,
        seeds = ["outgoing_transfer".as_bytes(), &token_client_account.key().as_ref(), &transfer_hash],
        bump = transfer_account.bump,
        seeds::program = client_program.key()
    )]
    pub transfer_account: Account<'info, TransferAccount>,
    #[account(
        seeds = [token_authority.key().as_ref(), &transfer_hash, b"refund-transfer"],
        bump = refund_transfer_account.bump,
        constraint = refund_transfer_account.user_address == to.key() && refund_transfer_account.token_address == token_account.key()
    )]
    pub refund_transfer_account: Box<Account<'info, RefundTransferAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub client_refund_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_sender: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct ReceiveMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [&token_client_account.authority.to_bytes(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub to: AccountInfo<'info>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = to,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
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
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_client_account.authority,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_client_account.system_fee_address,
    )]
    pub system_fee_token_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct MintToUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [&authority.key().as_ref(), name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        token::mint = mint,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub const TOKEN_CLIENT_ACCOUNT_LEN: usize = 1 // is is_initialized
    + PUBKEY_BYTES                            // authority
    + 128                                     // tx_id
    + 64                                      // fee
    + 64                                      // refund_fee
    + 64                                      // owner_fee_rate
    + 64                                      // system_fee_rate
    + PUBKEY_BYTES                            // system_fee_address
    + 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct TokenClientAccount {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub tx_id: u128,
    pub fee: u64,
    pub refund_fee: u64,
    pub owner_fee_rate: u64,
    pub system_fee_rate: u64,
    pub system_fee_address: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(name: String, decimals: u8)]
pub struct CreateMint<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        mint::decimals = decimals,
        mint::authority = token_client_account,
        seeds = [authority.key().as_ref(), name.as_bytes(), b"asterizm-token-mint"],
        bump,
        payer = authority
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + TOKEN_CLIENT_ACCOUNT_LEN,
        seeds = [authority.key().as_ref(), name.as_bytes(), b"asterizm-token-client"],
        bump
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_program_settings: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub client_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> CreateMint<'info> {
    fn to_create_client_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::CreateClient<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::CreateClient {
            payer: self.authority.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            settings_account: self.client_program_settings.to_account_info(),
            client_account: self.client_account.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

impl<'a, 'b, 'c, 'info> SendMessage<'info> {
    fn to_burn_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            authority: self.signer.to_account_info(),
            from: self.from.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_mint_owner(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.owner_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_mint_system(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.system_fee_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_send_message_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitSendMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::InitSendMessage {
            signer: self.signer.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            settings_account: self.client_settings_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.clone(),
            transfer_account: self.transfer_account.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
            chain_account: self.chain_account.clone(),
            relayer_program: self.relayer_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

impl<'a, 'b, 'c, 'info> AddRefundRequest<'info> {
    fn to_add_refund_request(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::AddRefundRequest<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::AddRefundRequest {
            signer: self.signer.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            transfer_account: self.transfer_account.to_account_info(),
            refund_account: self.client_refund_account.clone(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

impl<'a, 'b, 'c, 'info> ReceiveMessage<'info> {
    fn to_mint_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_mint_owner(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.owner_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_mint_system(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.system_fee_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }

    fn to_receive_message_cpi(
        &self,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::ReceiveMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::ReceiveMessage {
            authority: self.authority.to_account_info(),
            settings_account: self.client_settings_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            sender: self.client_sender.to_account_info(),
            trusted_address: self.client_trusted_address.to_account_info(),
            transfer_account: self.transfer_account.clone(),
            chain_account: self.chain_account.clone(),
            relayer_program: self.relayer_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'a, 'b, 'c, 'info> MintToUser<'info> {
    fn to_mint_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

impl<'a, 'b, 'c, 'info> ProcessRefundRequest<'info> {
    fn to_mint_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            authority: self.token_client_account.to_account_info(),
            to: self.token_account.to_account_info(),
            mint: self.mint.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
    fn to_process_refund_request(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::ProcessRefundRequest<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::ProcessRefundRequest {
            authority: self.signer.to_account_info(),
            client_account: self.client_account.to_account_info(),
            transfer_account: self.transfer_account.to_account_info(),
            refund_account: self.client_refund_account.clone(),
            sender: self.client_sender.clone(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateFee<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [authority.key().as_ref(), name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct UpdateClientParams<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_program_settings: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub client_account: UncheckedAccount<'info>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> UpdateClientParams<'info> {
    fn to_update_client_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::UpdateClient<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::UpdateClient {
            payer: self.authority.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            settings_account: self.client_program_settings.to_account_info(),
            client_account: self.client_account.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct CreateClientTrustedAddress<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub trusted_address: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> CreateClientTrustedAddress<'info> {
    fn to_create_client_trusted_address_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<
        'a,
        'b,
        'c,
        'info,
        asterizm_client::cpi::accounts::CreateClientTrustedAddress<'info>,
    > {
        let cpi_accounts = asterizm_client::cpi::accounts::CreateClientTrustedAddress {
            payer: self.authority.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct RemoveClientTrustedAddress<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub trusted_address: UncheckedAccount<'info>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> RemoveClientTrustedAddress<'info> {
    fn to_remove_client_trusted_address_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<
        'a,
        'b,
        'c,
        'info,
        asterizm_client::cpi::accounts::RemoveClientTrustedAddress<'info>,
    > {
        let cpi_accounts = asterizm_client::cpi::accounts::RemoveClientTrustedAddress {
            authority: self.token_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct CreateClientSender<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub sender: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> CreateClientSender<'info> {
    fn to_create_client_sender_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::CreateClientSender<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::CreateClientSender {
            payer: self.authority.to_account_info(),
            authority: self.token_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            sender: self.sender.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct RemoveClientSender<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub sender: UncheckedAccount<'info>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> RemoveClientSender<'info> {
    fn to_remove_client_sender_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::RemoveClientSender<'info>>
    {
        let cpi_accounts = asterizm_client::cpi::accounts::RemoveClientSender {
            authority: self.token_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            sender: self.sender.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
#[instruction(_token_name: String, mint_bump: u8)]
pub struct AddMeta<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [&authority.key().as_ref(), _token_name.as_bytes(), b"asterizm-token-client"],
        bump = token_client_account.bump,
    )]
    pub token_client_account: Box<Account<'info, TokenClientAccount>>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), _token_name.as_bytes(), b"asterizm-token-mint"],
        bump = mint_bump,
    )]
    pub mint: Account<'info, Mint>,
    pub metadata_program: Program<'info, Metadata>,
    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub token_metadata: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}
