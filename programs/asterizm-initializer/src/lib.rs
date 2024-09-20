use anchor_lang::prelude::*;

declare_id!("AsE15Mep8EJundywoGRs2XbKY28HghJ7HZ4b7qN3uiJc");

declare_program!(asterizm_relayer);

declare_program!(asterizm_client);

mod models;

pub use models::*;

#[program]
pub mod asterizm_initializer {
    use super::*;
    use anchor_lang::solana_program::sysvar::instructions::get_instruction_relative;
    use anchor_lang::system_program::{transfer, Transfer};

    pub fn initialize(
        ctx: Context<Initialize>,
        local_chain_id: u64,
        manager: Pubkey,
    ) -> Result<()> {
        ctx.accounts.settings_account.is_initialized = true;
        ctx.accounts.settings_account.manager = manager;
        ctx.accounts.settings_account.local_chain_id = local_chain_id;
        ctx.accounts.settings_account.bump = ctx.bumps.settings_account;

        emit!(CreateInitializerSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
            local_chain_id,
        });

        Ok(())
    }
    pub fn update_settings(ctx: Context<UpdateSettings>, manager: Pubkey) -> Result<()> {
        ctx.accounts.settings_account.manager = manager;

        emit!(UpdateInitializerSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
        });

        Ok(())
    }
    pub fn block_account(
        ctx: Context<BlockAccount>,
        chain_id: u64,
        user_address: Pubkey,
    ) -> Result<()> {
        ctx.accounts.blocked_account.is_blocked = true;
        ctx.accounts.blocked_account.chain_id = chain_id;
        ctx.accounts.blocked_account.user_address = user_address;
        ctx.accounts.blocked_account.bump = ctx.bumps.blocked_account;

        emit!(BlockAccountEvent {
            address: ctx.accounts.blocked_account.key(),
            chain_id,
            user_address,
        });

        Ok(())
    }

    pub fn send_message(
        ctx: Context<InitSendMessage>,
        relay_owner: Pubkey,
        dst_chain_id: u64,
        src_address: Pubkey,
        dst_address: Pubkey,
        tx_id: u128,
        transfer_hash: [u8; 32],
        transfer_result_notify_flag: bool,
        value: u64,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Initializer via CPI
        if current_ix.program_id != asterizm_client::ID {
            msg!("Only Client can call Initializer Send message instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        let mut value = value;
        // make cpi to relayer
        let relay_account_owner = if relay_owner == ctx.accounts.system_relay_account_owner.key() {
            ctx.accounts.system_relay_account_owner.clone()
        } else {
            // transfer fee to system relay owner
            let system_fee = ctx.accounts.relayer_settings_account.system_fee;
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.system_relay_account_owner.clone(),
                },
            );
            transfer(cpi_context, system_fee)?;
            value -= system_fee;
            if let Some(ref owner) = ctx.accounts.relay_account_owner {
                owner.clone()
            } else {
                return Err(ErrorCode::AccountNotEnoughKeys.into());
            }
        };

        asterizm_relayer::cpi::send_message(
            ctx.accounts.to_send_message(relay_account_owner),
            relay_owner,
            dst_chain_id,
            src_address,
            dst_address,
            tx_id,
            transfer_result_notify_flag,
            transfer_hash,
            value,
        )?;

        // fill transfer account
        ctx.accounts.transfer_account.exists = true;

        emit!(OutgoingEvent {
            address: ctx.accounts.transfer_account.key(),
            transfer_hash,
        });

        Ok(())
    }

    pub fn resend_message(
        ctx: Context<ResendMessage>,
        relay_owner: Pubkey,
        src_address: Pubkey,
        transfer_hash: [u8; 32],
        value: u64,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Initializer via CPI
        if current_ix.program_id != asterizm_client::ID {
            msg!("Only Client can call Initializer Resend message instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        let mut value = value;
        // make cpi to relayer
        let relay_account_owner = if relay_owner == ctx.accounts.system_relay_account_owner.key() {
            ctx.accounts.system_relay_account_owner.clone()
        } else {
            // transfer fee to system relay owner
            let system_fee = ctx.accounts.relayer_settings_account.system_fee;
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.system_relay_account_owner.clone(),
                },
            );
            transfer(cpi_context, system_fee)?;
            value -= system_fee;
            if let Some(ref owner) = ctx.accounts.relay_account_owner {
                owner.clone()
            } else {
                return Err(ErrorCode::AccountNotEnoughKeys.into());
            }
        };

        asterizm_relayer::cpi::resend_message(
            ctx.accounts.to_send_message(relay_account_owner),
            relay_owner,
            src_address,
            transfer_hash,
            value,
        )?;

        emit!(OutgoingEvent {
            address: ctx.accounts.transfer_account.key(),
            transfer_hash,
        });

        Ok(())
    }

    pub fn init_transfer(
        ctx: Context<InitTransferMessage>,
        dst_address: Pubkey,
        src_address: Pubkey,
        src_chain_id: u64,
        tx_id: u128,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Init transfer via CPI
        if current_ix.program_id != asterizm_relayer::ID {
            msg!("Only Relayer can call Initializer Init transfer instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        asterizm_client::cpi::init_receive_message(
            ctx.accounts.into(),
            dst_address,
            src_address,
            src_chain_id,
            tx_id,
            transfer_hash,
        )?;

        // fill transfer account
        ctx.accounts.transfer_account.exists = true;

        emit!(IncomingEvent {
            address: ctx.accounts.transfer_account.key(),
            transfer_hash,
        });

        Ok(())
    }

    pub fn transfer_sending_result(
        ctx: Context<TransferSendingResultInitializer>,
        dst_address: Pubkey,
        transfer_hash: [u8; 32],
        status_code: u8,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Init transfer via CPI
        if current_ix.program_id != asterizm_relayer::ID {
            msg!("Only Relayer can call Initializer transfer send result instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        asterizm_client::cpi::transfer_sending_result(
            ctx.accounts.into(),
            dst_address,
            transfer_hash,
            status_code,
        )?;

        Ok(())
    }
}
