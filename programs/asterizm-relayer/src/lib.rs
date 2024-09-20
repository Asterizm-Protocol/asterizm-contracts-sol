use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("AsXCTmPnyFfxYGrymtL4wa56tk2GTBPu2q2nRAktMWyW");

declare_program!(asterizm_initializer);

declare_program!(asterizm_client);

mod models;

pub use models::*;

#[program]
pub mod asterizm_relayer {
    use super::*;
    use anchor_lang::solana_program::sysvar::instructions::get_instruction_relative;

    pub fn initialize(
        ctx: Context<Initialize>,
        system_relayer_owner: Pubkey,
        local_chain_id: u64,
        manager: Pubkey,
        system_fee: u64,
    ) -> Result<()> {
        ctx.accounts.settings_account.is_initialized = true;
        ctx.accounts.settings_account.manager = manager;
        ctx.accounts.settings_account.system_relayer_owner = system_relayer_owner;
        ctx.accounts.settings_account.local_chain_id = local_chain_id;
        ctx.accounts.settings_account.system_fee = system_fee;
        ctx.accounts.settings_account.bump = ctx.bumps.settings_account;

        emit!(CreateRelayerSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
            system_relayer_owner,
            local_chain_id,
            system_fee
        });

        ctx.accounts.relay_account.is_initialized = true;
        ctx.accounts.relay_account.fee = 0; // By default, all transfer will take system fee from settings
        ctx.accounts.relay_account.owner = system_relayer_owner;
        ctx.accounts.relay_account.bump = ctx.bumps.relay_account;

        emit!(CreateCustomRelayEvent {
            address: ctx.accounts.relay_account.key(),
            owner: system_relayer_owner,
            fee: 0,
        });

        ctx.accounts.chain_account.is_initialized = true;
        ctx.accounts.chain_account.id = local_chain_id;
        ctx.accounts.chain_account.name = "Solana".to_string();
        ctx.accounts.chain_account.chain_type = 4;
        ctx.accounts.chain_account.bump = ctx.bumps.chain_account;

        emit!(CreateChainEvent {
            address: ctx.accounts.chain_account.key(),
            id: local_chain_id,
            name: "Solana".to_string(),
        });

        Ok(())
    }
    pub fn update_settings(
        ctx: Context<UpdateSettings>,
        manager: Pubkey,
        system_fee: u64,
    ) -> Result<()> {
        ctx.accounts.settings_account.manager = manager;
        ctx.accounts.settings_account.system_fee = system_fee;

        emit!(UpdateRelayerSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
            system_fee
        });

        Ok(())
    }

    pub fn create_custom_relay(
        ctx: Context<CreateCustomRelay>,
        owner: Pubkey,
        fee: u64,
    ) -> Result<()> {
        ctx.accounts.relay_account.is_initialized = true;
        ctx.accounts.relay_account.owner = owner;
        ctx.accounts.relay_account.fee = fee;
        ctx.accounts.relay_account.bump = ctx.bumps.relay_account;

        emit!(CreateCustomRelayEvent {
            address: ctx.accounts.relay_account.key(),
            owner,
            fee,
        });

        Ok(())
    }
    pub fn update_custom_relay(
        ctx: Context<UpdateCustomRelay>,
        owner: Pubkey,
        fee: u64,
    ) -> Result<()> {
        ctx.accounts.relay_account.fee = fee;

        emit!(UpdateCustomRelayEvent {
            address: ctx.accounts.relay_account.key(),
            owner,
            fee,
        });

        Ok(())
    }

    pub fn create_chain(
        ctx: Context<CreateChain>,
        id: u64,
        name: String,
        chain_type: u8,
    ) -> Result<()> {
        ctx.accounts.chain_account.is_initialized = true;
        ctx.accounts.chain_account.id = id;
        ctx.accounts.chain_account.chain_type = chain_type;
        ctx.accounts.chain_account.name = name.clone();
        ctx.accounts.chain_account.bump = ctx.bumps.chain_account;

        emit!(CreateChainEvent {
            address: ctx.accounts.chain_account.key(),
            id,
            name,
        });

        Ok(())
    }

    pub fn update_chain_type(ctx: Context<UpdateChainType>, id: u64, chain_type: u8) -> Result<()> {
        ctx.accounts.chain_account.chain_type = chain_type;

        emit!(UpdateChainTypeEvent {
            address: ctx.accounts.chain_account.key(),
            id,
            chain_type,
        });

        Ok(())
    }

    pub fn send_message(
        ctx: Context<SendMessage>,
        relay_owner: Pubkey,
        dst_chain_id: u64,
        src_address: Pubkey,
        dst_address: Pubkey,
        tx_id: u128,
        transfer_result_notify_flag: bool,
        transfer_hash: [u8; 32],
        value: u64,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Relayer via CPI
        if current_ix.program_id != asterizm_client::ID
            && current_ix.program_id != asterizm_initializer::ID
        {
            msg!("Only Client or Initializer can call Relayer Send message instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        if value < ctx.accounts.relay_account.fee {
            msg!("Not enough amount to pay for relayer fee");
            return Err(ProgramError::InsufficientFunds.into());
        }

        let local_chain_id = ctx.accounts.settings_account.local_chain_id;
        let dto = TrSendMessageRequestDto {
            src_chain_id: local_chain_id,
            src_address,
            dst_chain_id,
            dst_address,
            tx_id,
            transfer_result_notify_flag,
            transfer_hash,
            relay_owner,
        };

        let mut payload = vec![];
        dto.serialize(&mut payload)?;

        // transfer fee to relay
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.relay_account_owner.clone(),
            },
        );
        transfer(cpi_context, value)?;

        emit!(SendRelayerFee {
            fee: ctx.accounts.relay_account.fee,
            relay_account_owner: ctx.accounts.relay_account_owner.key()
        });

        emit!(SendMessageEvent { value, payload });

        Ok(())
    }

    pub fn resend_message(
        ctx: Context<ResendMessage>,
        _relay_owner: Pubkey,
        src_address: Pubkey,
        transfer_hash: [u8; 32],
        value: u64,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Relayer via CPI
        if current_ix.program_id != asterizm_client::ID
            && current_ix.program_id != asterizm_initializer::ID
        {
            msg!("Only Client or Initializer can call Relayer Send message instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        if value < ctx.accounts.relay_account.fee {
            msg!("Not enough amount to pay for relayer fee");
            return Err(ProgramError::InsufficientFunds.into());
        }

        // transfer fee to relay
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.relay_account_owner.clone(),
            },
        );
        transfer(cpi_context, value)?;

        emit!(SendRelayerFee {
            fee: ctx.accounts.relay_account.fee,
            relay_account_owner: ctx.accounts.relay_account_owner.key()
        });

        emit!(ResendFailedTransferEvent { value, transfer_hash, src_address });

        Ok(())
    }

    pub fn transfer_message(
        ctx: Context<TransferMessage>,
        relay_owner: Pubkey,
        src_chain_id: u64,
        src_address: Pubkey,
        dst_address: Pubkey,
        tx_id: u128,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        let local_chain_id = ctx.accounts.settings_account.local_chain_id;
        let dto = TrTransferMessageRequestDto {
            src_chain_id,
            src_address,
            dst_chain_id: local_chain_id,
            dst_address,
            tx_id,
            transfer_hash,
            relay_owner,
        };

        let mut payload = vec![];
        dto.serialize(&mut payload)?;

        asterizm_initializer::cpi::init_transfer(
            ctx.accounts.into(),
            dst_address,
            src_address,
            src_chain_id,
            tx_id,
            transfer_hash,
        )?;

        emit!(TransferSendEvent {
            src_chain_id,
            src_address,
            dst_address,
            transfer_hash
        });

        Ok(())
    }

    pub fn transfer_sending_result(
        ctx: Context<TransferSendingResultNotification>,
        _relay_owner: Pubkey,
        dst_address: Pubkey,
        transfer_hash: [u8; 32],
        status_code: u8,
    ) -> Result<()> {
        asterizm_initializer::cpi::transfer_sending_result(
            ctx.accounts.into(),
            dst_address,
            transfer_hash,
            status_code,
        )?;

        Ok(())
    }
}
