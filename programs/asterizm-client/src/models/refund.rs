use anchor_lang::prelude::*;

use super::{ClientAccount, TransferAccount};

pub const REFUND_ACCOUNT_LEN: usize = 1   // is_initialized
+ 1                                       // status
+ 1                                       // bump
;

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq, Eq)]
pub enum RefundStatus {
    Pending,
    Canceled,
    Success,
}

impl Default for RefundStatus {
    fn default() -> Self {
        RefundStatus::Pending
    }
}

#[account]
#[derive(Default)]
pub struct RefundAccount {
    pub is_initialized: bool,
    pub status: RefundStatus,
    pub bump: u8,
}

#[event]
pub struct AddRefundRequestEvent {
    pub transfer_hash: [u8; 32],
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, transfer_hash: [u8; 32])]
pub struct AddRefundRequest<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump,
        constraint = client_account.refund_enabled
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["outgoing_transfer".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump = transfer_account.bump,
        constraint = !transfer_account.success_execute && !transfer_account.refunded
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    #[account(
        init,
        payer = signer,
        space = 8 + REFUND_ACCOUNT_LEN,
        seeds = ["refund".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump
    )]
    pub refund_account: Box<Account<'info, RefundAccount>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, transfer_hash: [u8; 32])]
pub struct ProcessRefundRequest<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump,
        constraint = client_account.refund_enabled
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(
        seeds = ["outgoing_transfer".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump = transfer_account.bump,
        constraint = !transfer_account.success_execute && !transfer_account.refunded
    )]
    pub transfer_account: Box<Account<'info, TransferAccount>>,
    #[account(mut,
        seeds = ["refund".as_bytes(), &user_address.to_bytes(), &transfer_hash],
        bump = refund_account.bump,
        constraint = refund_account.status == RefundStatus::Pending
    )]
    pub refund_account: Box<Account<'info, RefundAccount>>,
}

#[derive(Accounts)]
#[instruction(user_address: Pubkey, transfer_hash: [u8; 32])]
pub struct ConfirmIncomingRefund<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = ["client".as_bytes(), &user_address.to_bytes()],
        bump = client_account.bump,
        constraint = client_account.refund_enabled && authority.key() == user_address
    )]
    pub client_account: Box<Account<'info, ClientAccount>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we will create it inside this instruction
    pub transfer_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
