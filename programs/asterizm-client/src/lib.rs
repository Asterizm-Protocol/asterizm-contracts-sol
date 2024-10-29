use anchor_lang::prelude::*;

declare_id!("As34Rx7ZJKc6JETxaYSZ7fHUkmhhBLhLzjMdTXJTuXDS");

declare_program!(asterizm_initializer);

declare_program!(asterizm_relayer);

mod models;

pub use models::*;

#[program]
pub mod asterizm_client {
    use super::*;
    use anchor_lang::solana_program::hash::hash;
    use anchor_lang::solana_program::program::invoke_signed;
    use anchor_lang::solana_program::system_instruction;
    use anchor_lang::solana_program::sysvar::instructions::get_instruction_relative;

    pub fn initialize(
        ctx: Context<Initialize>,
        local_chain_id: u64,
        manager: Pubkey,
    ) -> Result<()> {
        ctx.accounts.settings_account.is_initialized = true;
        ctx.accounts.settings_account.manager = manager;
        ctx.accounts.settings_account.local_chain_id = local_chain_id;
        ctx.accounts.settings_account.bump = ctx.bumps.settings_account;

        emit!(CreateClientSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
            local_chain_id,
        });

        Ok(())
    }

    pub fn update_settings(ctx: Context<UpdateSettings>, manager: Pubkey) -> Result<()> {
        ctx.accounts.settings_account.manager = manager;

        emit!(UpdateClientSettingsEvent {
            address: ctx.accounts.settings_account.key(),
            manager,
        });

        Ok(())
    }

    pub fn create_client(
        ctx: Context<CreateClientAccount>,
        user_address: Pubkey,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
        refund_enabled: bool,
    ) -> Result<()> {
        ctx.accounts.client_account.is_initialized = true;
        ctx.accounts.client_account.user_address = user_address;
        ctx.accounts.client_account.relay_owner = relay_owner;
        ctx.accounts.client_account.notify_transfer_sending_result = notify_transfer_sending_result;
        ctx.accounts.client_account.disable_hash_validation = disable_hash_validation;
        ctx.accounts.client_account.refund_enabled = refund_enabled;
        ctx.accounts.client_account.bump = ctx.bumps.client_account;

        emit!(ClientCreatedEvent {
            address: ctx.accounts.client_account.key(),
            user_address,
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
        });

        Ok(())
    }

    pub fn update_client(
        ctx: Context<UpdateClientAccount>,
        user_address: Pubkey,
        relay_owner: Pubkey,
        notify_transfer_sending_result: bool,
        disable_hash_validation: bool,
        refund_enabled: bool,
    ) -> Result<()> {
        ctx.accounts.client_account.relay_owner = relay_owner;
        ctx.accounts.client_account.notify_transfer_sending_result = notify_transfer_sending_result;
        ctx.accounts.client_account.disable_hash_validation = disable_hash_validation;
        ctx.accounts.client_account.refund_enabled = refund_enabled;

        emit!(ClientUpdatedEvent {
            address: ctx.accounts.client_account.key(),
            user_address,
            relay_owner,
            notify_transfer_sending_result,
            disable_hash_validation,
            refund_enabled,
        });

        Ok(())
    }

    pub fn create_client_trusted_address(
        ctx: Context<CreateClientTrustedAddress>,
        user_address: Pubkey,
        chain_id: u64,
        address: Pubkey,
    ) -> Result<()> {
        ctx.accounts.trusted_address.is_initialized = true;
        ctx.accounts.trusted_address.user_address = user_address;
        ctx.accounts.trusted_address.address = address;
        ctx.accounts.trusted_address.chain_id = chain_id;
        ctx.accounts.trusted_address.bump = ctx.bumps.trusted_address;

        emit!(ClientTrustedAddressCreatedEvent {
            address,
            user_address,
            chain_id,
        });

        Ok(())
    }

    pub fn remove_client_trusted_address(
        _ctx: Context<RemoveClientTrustedAddress>,
        user_address: Pubkey,
        chain_id: u64,
    ) -> Result<()> {
        emit!(ClientTrustedAddressRemovedEvent {
            user_address,
            chain_id,
        });

        Ok(())
    }

    pub fn create_client_sender(
        ctx: Context<CreateClientSender>,
        user_address: Pubkey,
        address: Pubkey,
    ) -> Result<()> {
        ctx.accounts.sender.is_initialized = true;
        ctx.accounts.sender.user_address = user_address;
        ctx.accounts.sender.address = address;
        ctx.accounts.sender.bump = ctx.bumps.sender;

        emit!(ClientSenderCreatedEvent {
            address,
            user_address,
        });

        Ok(())
    }

    pub fn remove_client_sender(
        _ctx: Context<RemoveClientSender>,
        user_address: Pubkey,
        address: Pubkey,
    ) -> Result<()> {
        emit!(ClientSenderRemovedEvent {
            address,
            user_address,
        });

        Ok(())
    }

    pub fn init_send_message(
        ctx: Context<InitSendMessage>,
        user_address: Pubkey,
        dst_chain_id: u64,
        payload: Vec<u8>,
        tx_id: u128,
    ) -> Result<()> {
        ctx.accounts.client_account.tx_id += 1;

        let message = InitMessage {
            src_chain_id: ctx.accounts.settings_account.local_chain_id,
            src_address: user_address,
            dst_chain_id,
            dst_address: ctx.accounts.trusted_address.address,
            tx_id,
            payload: payload.clone(),
        };

        let buffer = serialize_init_message_eth(message);

        let transfer_hash = if ctx.accounts.chain_account.chain_type == 1
            || ctx.accounts.chain_account.chain_type == 4
        {
            hash(&buffer).to_bytes()
        } else {
            build_crosschain_hash(&buffer)
        };

        // Find outgoing transfer account
        let (outgoing_transfer_account, outgoing_transfer_bump) = Pubkey::find_program_address(
            &[
                br"outgoing_transfer",
                &user_address.to_bytes(),
                &transfer_hash,
            ],
            &ID,
        );

        let outgoing_transfer_account_signer_seeds: &[&[_]] = &[
            br"outgoing_transfer",
            &user_address.to_bytes(),
            &transfer_hash,
            &[outgoing_transfer_bump],
        ];

        if outgoing_transfer_account != ctx.accounts.transfer_account.key() {
            return Err(ProgramError::InvalidArgument.into());
        }

        invoke_signed(
            &system_instruction::create_account(
                &ctx.accounts.signer.key(),
                &ctx.accounts.transfer_account.key(),
                1.max(ctx.accounts.rent.minimum_balance(TRANSFER_ACCOUNT_LEN + 8)),
                (TRANSFER_ACCOUNT_LEN + 8) as u64,
                &ID,
            ),
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.transfer_account.clone(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[outgoing_transfer_account_signer_seeds],
        )?;

        // Init Transfer Account
        let transfer_account_data = TransferAccount {
            success_receive: true,
            success_execute: false,
            refunded: false,
            bump: outgoing_transfer_bump,
        };

        transfer_account_data
            .try_serialize(&mut *ctx.accounts.transfer_account.try_borrow_mut_data()?)?;

        emit!(InitiateTransferEvent {
            dst_chain_id,
            trusted_address: ctx.accounts.trusted_address.address,
            id: tx_id,
            transfer_hash,
            payload,
        });

        Ok(())
    }

    pub fn send_message(
        ctx: Context<SendMessage>,
        user_address: Pubkey,
        dst_chain_id: u64,
        tx_id: u128,
        transfer_hash: [u8; 32],
        value: u64,
    ) -> Result<()> {
        asterizm_initializer::cpi::send_message(
            ctx.accounts.into(),
            ctx.accounts.client_account.relay_owner,
            dst_chain_id,
            user_address,
            ctx.accounts.trusted_address.address,
            tx_id,
            transfer_hash,
            ctx.accounts.client_account.notify_transfer_sending_result,
            value,
        )?;

        ctx.accounts.transfer_account.success_execute = true;

        Ok(())
    }

    pub fn resend_message(
        ctx: Context<ResendMessage>,
        user_address: Pubkey,
        transfer_hash: [u8; 32],
        value: u64,
    ) -> Result<()> {
        asterizm_initializer::cpi::resend_message(
            ctx.accounts.into(),
            ctx.accounts.client_account.relay_owner,
            user_address,
            transfer_hash,
            value,
        )?;

        Ok(())
    }

    pub fn add_refund_request(
        ctx: Context<AddRefundRequest>,
        _user_address: Pubkey,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        ctx.accounts.refund_account.is_initialized = true;
        ctx.accounts.refund_account.status = RefundStatus::Pending;
        ctx.accounts.refund_account.bump = ctx.bumps.refund_account;

        emit!(AddRefundRequestEvent { transfer_hash });

        Ok(())
    }

    pub fn process_refund_request(
        ctx: Context<ProcessRefundRequest>,
        _user_address: Pubkey,
        _transfer_hash: [u8; 32],
        status: bool,
    ) -> Result<()> {
        ctx.accounts.transfer_account.refunded = true;

        ctx.accounts.refund_account.status = if status {
            RefundStatus::Success
        } else {
            RefundStatus::Canceled
        };

        Ok(())
    }

    pub fn confirm_incoming_refund(
        ctx: Context<ConfirmIncomingRefund>,
        user_address: Pubkey,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        // Find incoming transfer account
        let (incoming_transfer_account, incoming_transfer_bump) = Pubkey::find_program_address(
            &[
                br"incoming_transfer",
                &user_address.to_bytes(),
                &transfer_hash,
            ],
            &ID,
        );

        if incoming_transfer_account != ctx.accounts.transfer_account.key() {
            return Err(ProgramError::InvalidArgument.into());
        }

        let incoming_transfer_account_signer_seeds: &[&[_]] = &[
            br"incoming_transfer",
            &user_address.to_bytes(),
            &transfer_hash,
            &[incoming_transfer_bump],
        ];

        if ctx.accounts.transfer_account.lamports() == 0 {
            invoke_signed(
                &system_instruction::create_account(
                    &ctx.accounts.authority.key(),
                    &ctx.accounts.transfer_account.key(),
                    1.max(ctx.accounts.rent.minimum_balance(TRANSFER_ACCOUNT_LEN + 8)),
                    (TRANSFER_ACCOUNT_LEN + 8) as u64,
                    &ID,
                ),
                &[
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.transfer_account.clone(),
                    ctx.accounts.rent.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[incoming_transfer_account_signer_seeds],
            )?;

            // Init Transfer Account
            let transfer_account_data = TransferAccount {
                success_receive: false,
                success_execute: false,
                refunded: true,
                bump: incoming_transfer_bump,
            };

            transfer_account_data
                .try_serialize(&mut *ctx.accounts.transfer_account.try_borrow_mut_data()?)?;
        } else {
            let mut transfer_account = TransferAccount::try_deserialize(
                &mut &**ctx.accounts.transfer_account.try_borrow_mut_data()?,
            )?;
            transfer_account.refunded = true;
            transfer_account
                .try_serialize(&mut *ctx.accounts.transfer_account.try_borrow_mut_data()?)?;
        }

        Ok(())
    }

    pub fn init_receive_message(
        ctx: Context<InitReceiveMessage>,
        _dst_address: Pubkey,
        src_address: Pubkey,
        src_chain_id: u64,
        tx_id: u128,
        transfer_hash: [u8; 32],
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Receive message via CPI
        if current_ix.program_id != asterizm_relayer::ID {
            msg!("Only Relayer can call Client init Receive message instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        ctx.accounts.transfer_account.success_receive = true;
        ctx.accounts.transfer_account.bump = ctx.bumps.transfer_account;

        emit!(PayloadReceivedEvent {
            src_chain_id,
            src_address,
            tx_id,
            transfer_hash
        });

        Ok(())
    }

    pub fn receive_message(
        ctx: Context<ReceiveMessage>,
        dst_address: Pubkey,
        tx_id: u128,
        src_chain_id: u64,
        src_address: Pubkey,
        transfer_hash: [u8; 32],
        payload: Vec<u8>,
    ) -> Result<()> {
        let message = InitMessage {
            src_chain_id,
            src_address,
            dst_chain_id: ctx.accounts.settings_account.local_chain_id,
            dst_address,
            tx_id,
            payload: payload.clone(),
        };

        let buffer = serialize_init_message_eth(message);

        let calculated_transfer_hash = if ctx.accounts.chain_account.chain_type == 1
            || ctx.accounts.chain_account.chain_type == 4
        {
            hash(&buffer).to_bytes()
        } else {
            build_crosschain_hash(&buffer)
        };

        if !ctx.accounts.client_account.disable_hash_validation {
            if calculated_transfer_hash != transfer_hash {
                return Err(ProgramError::InvalidArgument.into());
            }
        }

        ctx.accounts.transfer_account.success_execute = true;

        Ok(())
    }

    pub fn transfer_sending_result(
        ctx: Context<TransferSendingResult>,
        dst_address: Pubkey,
        transfer_hash: [u8; 32],
        status_code: u8,
    ) -> Result<()> {
        let current_ix =
            get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account).unwrap();

        // Restrict Who can call Receive message via CPI
        if current_ix.program_id != asterizm_relayer::ID {
            msg!("Only Relayer can call Client transfer sending result instruction");
            return Err(ProgramError::IncorrectProgramId.into());
        }

        emit!(TransferSendingResultEvent {
            dst_address,
            transfer_hash,
            status_code,
        });

        Ok(())
    }
}
