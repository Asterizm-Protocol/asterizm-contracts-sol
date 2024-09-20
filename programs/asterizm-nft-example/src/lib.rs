use crate::asterizm_client::accounts::ClientAccount;
use crate::asterizm_client::program::AsterizmClient;
use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;
use anchor_lang::solana_program::sysvar;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::{
    instructions::{BurnV1CpiBuilder, CreateV1CpiBuilder, MintV1CpiBuilder, UpdateV1CpiBuilder},
    types::{Data, PrintSupply, TokenStandard},
};

declare_id!("AsGHptNAzEa1UXw4mWRy1WXmBsi11CMaZ2RJ9p6cn1SF");

declare_program!(asterizm_client);

#[program]
pub mod asterizm_nft_example {

    use super::*;
    pub fn receive_message(
        ctx: Context<ReceiveMessage>,
        transfer_hash: [u8; 32],
        src_account: Pubkey,
        src_chain_id: u64,
        tx_id: u128,
        payload: Vec<u8>,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        let data = deserialize_message_payload_eth(&payload)?;

        asterizm_client::cpi::receive_message(
            ctx.accounts.to_receive_message_cpi(),
            ctx.accounts.nft_client_account.key(),
            tx_id,
            src_chain_id,
            src_account,
            transfer_hash,
            payload,
        )?;

        ctx.accounts.nft_data_account.is_initialized = true;
        ctx.accounts.nft_data_account.bump = ctx.bumps.nft_data_account;
        ctx.accounts.nft_data_account.dst_address = data.dst_address;
        ctx.accounts.nft_data_account.uri = uri;
        ctx.accounts.nft_data_account.name = name;
        ctx.accounts.nft_data_account.symbol = symbol;

        Ok(())
    }

    pub fn create_nft(ctx: Context<CreateNft>, _transfer_hash: [u8; 32]) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        let uri = ctx.accounts.nft_data_account.uri.clone();
        let name = ctx.accounts.nft_data_account.name.clone();
        let symbol = ctx.accounts.nft_data_account.symbol.clone();
        ctx.accounts.nft_data_account.is_used = true;

        CreateV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
            .mint(&ctx.accounts.mint.to_account_info(), true)
            .decimals(0)
            .authority(&ctx.accounts.nft_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .update_authority(&ctx.accounts.nft_client_account.to_account_info(), false)
            .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
            .name(name)
            .symbol(symbol)
            .uri(uri)
            .seller_fee_basis_points(0)
            .token_standard(TokenStandard::NonFungible)
            .print_supply(PrintSupply::Zero)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .invoke_signed(&signer)?;

        MintV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .token(&ctx.accounts.token_account)
            .token_owner(Some(&ctx.accounts.to))
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
            .mint(&ctx.accounts.mint.to_account_info())
            .authority(&ctx.accounts.nft_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .amount(1)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .spl_token_program(&ctx.accounts.token_program.to_account_info())
            .spl_ata_program(&ctx.accounts.associated_token_program.to_account_info())
            .invoke_signed(&signer)?;

        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNft>,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        CreateV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
            .mint(&ctx.accounts.mint.to_account_info(), true)
            .decimals(0)
            .authority(&ctx.accounts.nft_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .update_authority(&ctx.accounts.nft_client_account.to_account_info(), false)
            .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
            .name(name)
            .symbol(symbol)
            .uri(uri)
            .seller_fee_basis_points(0)
            .token_standard(TokenStandard::NonFungible)
            .print_supply(PrintSupply::Zero)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .invoke_signed(&signer)?;

        MintV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .token(&ctx.accounts.token_account)
            .token_owner(Some(&ctx.accounts.to))
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
            .mint(&ctx.accounts.mint.to_account_info())
            .authority(&ctx.accounts.nft_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .amount(1)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .spl_token_program(&ctx.accounts.token_program.to_account_info())
            .spl_ata_program(&ctx.accounts.associated_token_program.to_account_info())
            .invoke_signed(&signer)?;

        Ok(())
    }

    pub fn update_nft(ctx: Context<UpdateNft>, _transfer_hash: [u8; 32]) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        let uri = ctx.accounts.nft_data_account.uri.clone();
        let name = ctx.accounts.nft_data_account.name.clone();
        let symbol = ctx.accounts.nft_data_account.symbol.clone();
        ctx.accounts.nft_data_account.is_used = true;

        UpdateV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .authority(&ctx.accounts.nft_client_account.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .mint(&ctx.accounts.mint.to_account_info())
            .data(Data {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: None,
            })
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .invoke_signed(&signer)?;

        Ok(())
    }

    pub fn burn(
        ctx: Context<Burn>,
        nft_id: [u8; 32],
        dst_chain_id: u64,
        dst_address: Pubkey,
        uri: String,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        BurnV1CpiBuilder::new(&ctx.accounts.metadata_program.to_account_info())
            .authority(&ctx.accounts.signer.to_account_info())
            .metadata(&ctx.accounts.nft_metadata.to_account_info())
            .mint(&ctx.accounts.mint.to_account_info())
            .token(&ctx.accounts.token_account.to_account_info())
            .edition(Some(&ctx.accounts.master_edition_account))
            .amount(1)
            .system_program(&ctx.accounts.system_program.to_account_info())
            .sysvar_instructions(&ctx.accounts.instruction_sysvar_account)
            .spl_token_program(&ctx.accounts.token_program.to_account_info())
            .invoke()?;

        let tx_id = ctx.accounts.nft_client_account.tx_id;

        let payload = serialize_message_payload_eth(MessagePayload {
            dst_address,
            id: nft_id,
            uri,
        });

        asterizm_client::cpi::init_send_message(
            ctx.accounts.to_send_message_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            dst_chain_id,
            payload,
            tx_id,
        )?;

        ctx.accounts.nft_client_account.tx_id += 1;

        Ok(())
    }

    pub fn create_nft_client(
        ctx: Context<CreateNftClient>,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
    ) -> Result<()> {
        ctx.accounts.nft_client_account.is_initialized = true;
        ctx.accounts.nft_client_account.authority = ctx.accounts.authority.key();
        ctx.accounts.nft_client_account.tx_id = 0;
        ctx.accounts.nft_client_account.bump = ctx.bumps.nft_client_account;

        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client(
            ctx.accounts.to_create_client_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
        )?;

        Ok(())
    }

    pub fn update_nft_client(
        ctx: Context<UpdateNftClient>,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::update_client(
            ctx.accounts.to_update_client_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
        )?;

        Ok(())
    }

    pub fn create_client_trusted_address(
        ctx: Context<CreateClientTrustedAddress>,
        chain_id: u64,
        address: Pubkey,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client_trusted_address(
            ctx.accounts.to_create_client_trusted_address_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            chain_id,
            address,
        )?;

        Ok(())
    }
    pub fn remove_client_trusted_address(
        ctx: Context<RemoveClientTrustedAddress>,
        chain_id: u64,
    ) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::remove_client_trusted_address(
            ctx.accounts.to_remove_client_trusted_address_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            chain_id,
        )?;

        Ok(())
    }
    pub fn create_client_sender(ctx: Context<CreateClientSender>, address: Pubkey) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::create_client_sender(
            ctx.accounts.to_create_client_sender_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            address,
        )?;

        Ok(())
    }
    pub fn remove_client_sender(ctx: Context<RemoveClientSender>, address: Pubkey) -> Result<()> {
        let seeds: &[&[_]] = &[
            &ctx.accounts.nft_client_account.authority.to_bytes(),
            b"asterizm-nft-client",
            &[ctx.accounts.nft_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        asterizm_client::cpi::remove_client_sender(
            ctx.accounts.to_remove_client_sender_cpi(signer),
            ctx.accounts.nft_client_account.key(),
            address,
        )?;

        Ok(())
    }
}

pub const NFT_DATA_ACCOUNT_LEN: usize = 1 // is is_initialized
    + 200                            // uri
    + 15                            // name
    + 5                            // symbol
    + PUBKEY_BYTES                            // dst_address
    + 1                                       // is_used
    + 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct NftDataAccount {
    pub is_initialized: bool,
    pub uri: String,
    pub name: String,
    pub symbol: String,
    pub dst_address: Pubkey,
    pub is_used: bool,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(transfer_hash: [u8; 32])]
pub struct ReceiveMessage<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + NFT_DATA_ACCOUNT_LEN,
        seeds = [transfer_hash.as_ref(), b"asterizm-nft-data"],
        bump
    )]
    pub nft_data_account: Box<Account<'info, NftDataAccount>>,
    #[account(
        seeds = [&nft_client_account.authority.to_bytes(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_program: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_settings_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub trusted_address: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will check it inside client
    pub transfer_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_sender: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub chain_account: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub relayer_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

impl<'a, 'b, 'c, 'info> ReceiveMessage<'info> {
    fn to_receive_message_cpi(
        &self,
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::ReceiveMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::ReceiveMessage {
            authority: self.authority.to_account_info(),
            settings_account: self.client_settings_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.clone(),
            sender: self.client_sender.to_account_info(),
            transfer_account: self.transfer_account.clone(),
            chain_account: self.chain_account.clone(),
            relayer_program: self.relayer_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub mint: Signer<'info>,
    #[account(
        seeds = [&authority.key().to_bytes(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub to: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub token_account: AccountInfo<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    #[account(
    mut,
    seeds = [
    b"metadata".as_ref(),
    metadata_program.key().as_ref(),
    mint.key().as_ref(),
    b"edition".as_ref(),
    ],
    bump,
    seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub master_edition_account: UncheckedAccount<'info>,
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
    pub nft_metadata: UncheckedAccount<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(_transfer_hash: [u8; 32])]
pub struct CreateNft<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub mint: Signer<'info>,
    #[account(mut,
        seeds = [_transfer_hash.as_ref(), b"asterizm-nft-data"],
        bump = nft_data_account.bump,
        constraint = nft_data_account.dst_address == to.key(),
        constraint = !nft_data_account.is_used,
    )]
    pub nft_data_account: Box<Account<'info, NftDataAccount>>,
    #[account(
        seeds = [&nft_client_account.authority.to_bytes(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub to: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub token_account: AccountInfo<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    #[account(
    mut,
    seeds = [
    b"metadata".as_ref(),
    metadata_program.key().as_ref(),
    mint.key().as_ref(),
    b"edition".as_ref(),
    ],
    bump,
    seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub master_edition_account: UncheckedAccount<'info>,
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
    pub nft_metadata: UncheckedAccount<'info>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(_transfer_hash: [u8; 32])]
pub struct UpdateNft<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [_transfer_hash.as_ref(), b"asterizm-nft-data"],
        bump = nft_data_account.bump,
        constraint = nft_data_account.dst_address == to.key(),
        constraint = !nft_data_account.is_used,
    )]
    pub nft_data_account: Box<Account<'info, NftDataAccount>>,
    #[account(
        seeds = [&nft_client_account.authority.to_bytes(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub to: AccountInfo<'info>,
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
    pub nft_metadata: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Burn<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut,
        seeds = [&nft_client_account.authority.to_bytes(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut,
    associated_token::mint = mint,
    associated_token::authority = signer,
    )]
    pub token_account: Account<'info, TokenAccount>,
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
    pub nft_metadata: UncheckedAccount<'info>,
    #[account(
    mut,
    seeds = [
    b"metadata".as_ref(),
    metadata_program.key().as_ref(),
    mint.key().as_ref(),
    b"edition".as_ref(),
    ],
    bump,
    seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub master_edition_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
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
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: AccountInfo<'info>,
}

impl<'a, 'b, 'c, 'info> Burn<'info> {
    fn to_send_message_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::InitSendMessage<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::InitSendMessage {
            signer: self.signer.to_account_info(),
            authority: self.nft_client_account.to_account_info(),
            settings_account: self.client_settings_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.clone(),
            transfer_account: self.transfer_account.clone(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
            chain_account: self.chain_account.clone(),
            relayer_program: self.relayer_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Default, Debug)]
pub struct MessagePayload {
    pub dst_address: Pubkey,
    pub id: [u8; 32],
    pub uri: String,
}

pub fn serialize_message_payload_eth(message: MessagePayload) -> Vec<u8> {
    let mut result = vec![];

    let mut word = [0u8; 160];
    word[(32 - 4)..32].copy_from_slice(&32u32.to_be_bytes());
    word[32..64].copy_from_slice(&message.dst_address.to_bytes());
    word[64..96].copy_from_slice(&message.id);
    word[(128 - 4)..128].copy_from_slice(&96u32.to_be_bytes());
    word[(160 - 4)..160].copy_from_slice(&(message.uri.len() as u32).to_be_bytes());
    result.extend_from_slice(&word);
    result.extend_from_slice(&message.uri.as_bytes());
    let extension = 32 - result.len() % 32;
    result.extend_from_slice(&vec![0; extension]);

    result
}

pub fn deserialize_message_payload_eth(payload: &[u8]) -> Result<MessagePayload> {
    let dst_address = Pubkey::try_from_slice(&payload[32..64])?;
    let mut id = [0u8; 32];
    id.copy_from_slice(&payload[64..96]);

    let mut arr = [0u8; 4];
    arr.copy_from_slice(&payload[(160 - 4)..160]);
    let uri_len = u32::from_be_bytes(arr);

    let uri = String::from_utf8(payload[160..(160 + uri_len as usize)].to_vec())
        .map_err(|_| ProgramError::InvalidArgument)?;

    Ok(MessagePayload {
        id,
        dst_address,
        uri,
    })
}

pub const NFT_CLIENT_ACCOUNT_LEN: usize = 1 // is is_initialized
    + PUBKEY_BYTES                            // authority
    + 32                                      // tx_id
    + 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct NftClientAccount {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub tx_id: u128,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateNftClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + NFT_CLIENT_ACCOUNT_LEN,
        seeds = [authority.key().as_ref(), b"asterizm-nft-client"],
        bump
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
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

impl<'a, 'b, 'c, 'info> CreateNftClient<'info> {
    fn to_create_client_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::CreateClient<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::CreateClient {
            authority: self.authority.to_account_info(),
            settings_account: self.client_program_settings.to_account_info(),
            client_account: self.client_account.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
pub struct UpdateNftClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [authority.key().as_ref(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
    /// CHECK: This is not dangerous because we will check it inside client
    pub client_program_settings: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we will check it inside client
    #[account(mut)]
    pub client_account: AccountInfo<'info>,
    pub client_program: Program<'info, AsterizmClient>,
}

impl<'a, 'b, 'c, 'info> UpdateNftClient<'info> {
    fn to_update_client_cpi(
        &self,
        seeds: &'a [&'b [&'c [u8]]],
    ) -> CpiContext<'a, 'b, 'c, 'info, asterizm_client::cpi::accounts::UpdateClient<'info>> {
        let cpi_accounts = asterizm_client::cpi::accounts::UpdateClient {
            payer: self.authority.to_account_info(),
            authority: self.nft_client_account.to_account_info(),
            settings_account: self.client_program_settings.to_account_info(),
            client_account: self.client_account.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
pub struct CreateClientTrustedAddress<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
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
            authority: self.nft_client_account.to_account_info(),
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
pub struct RemoveClientTrustedAddress<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
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
            authority: self.nft_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            trusted_address: self.trusted_address.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}

#[derive(Accounts)]
pub struct CreateClientSender<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
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
            authority: self.nft_client_account.to_account_info(),
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
pub struct RemoveClientSender<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut,
        seeds = [&authority.key().as_ref(), b"asterizm-nft-client"],
        bump = nft_client_account.bump,
    )]
    pub nft_client_account: Box<Account<'info, NftClientAccount>>,
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
            authority: self.nft_client_account.to_account_info(),
            client_account: self.client_account.to_account_info(),
            sender: self.sender.to_account_info(),
        };
        let cpi_program = self.client_program.to_account_info();
        CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
    }
}
