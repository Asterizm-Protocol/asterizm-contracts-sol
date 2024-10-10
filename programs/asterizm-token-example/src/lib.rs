use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;
use anchor_spl::token::*;

declare_id!("AsUG3qmKKMjEYZDCTqo4hJEnLmxGj82SDGiXci1hNFBx");

declare_program!(asterizm_client);

use crate::asterizm_client::accounts::{ClientAccount, ClientTrustedAddress};
use crate::asterizm_client::program::AsterizmClient;

#[program]
mod asterizm_token_example {
    use super::*;
    use anchor_lang::system_program::{transfer, Transfer};

    pub fn send_message(
        ctx: Context<SendMessage>,
        _name: String,
        amount: u64,
        dst_address: Pubkey,
        dst_chain_id: u64,
    ) -> Result<()> {
        // transfer fee to token authority
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

        burn(ctx.accounts.to_burn_cpi(signer), amount)?;

        let tx_id = ctx.accounts.token_client_account.tx_id;

        let payload = serialize_message_payload_eth(MessagePayload {
            dst_address,
            amount,
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

        let seeds: &[&[_]] = &[
            &ctx.accounts.token_client_account.authority.to_bytes(),
            _name.as_bytes(),
            b"asterizm-token-client",
            &[ctx.accounts.token_client_account.bump],
        ];
        let signer: &[&[&[u8]]] = &[&seeds[..]];

        mint_to(ctx.accounts.to_mint_cpi(signer), data.amount)
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
        fee: u64,
    ) -> Result<()> {
        ctx.accounts.token_client_account.is_initialized = true;
        ctx.accounts.token_client_account.tx_id = 0;
        ctx.accounts.token_client_account.fee = fee;
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
        )?;

        Ok(())
    }

    pub fn update_fee(ctx: Context<UpdateFee>, _name: String, fee: u64) -> Result<()> {
        ctx.accounts.token_client_account.fee = fee;
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
}

#[derive(Accounts)]
#[instruction(_name: String)]
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
    + 1                                       // bump
;

#[account]
#[derive(Default)]
pub struct TokenClientAccount {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub tx_id: u128,
    pub fee: u64,
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
