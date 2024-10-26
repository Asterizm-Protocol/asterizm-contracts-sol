# [Initializer Contract](./programs/asterizm-initializer/src/lib.rs)

## Purpose
The Initializer Contract is responsible for receiving encrypted or unencrypted transactions from the Client Contract.

## Key Methods
- `send_message` and `resend_message`: Methods to send and resend messages
- `init_transfer`: A method to initialize message transfer
- `transfer_sending_result`: A method to transfer result from relayer

# [Client Contract](./programs/asterizm-client/src/lib.rs)
## Purpose:
The Client Contract is responsible for receiving and processing events from other blockchains. A single contract can handle both sending and receiving logic, or two separate contracts can be utilized for these functions.

## Base Contract Methods:
- `init_send_message`: This method initiates a message transfer
- `send_message` and `resend_message`: This methods are used to send/resend the initialized message to a destination chain
- `init_receive_message`: This method initializes message reception
- `receive_message`: This method completes the transfer by validating the payload hash
- `transfer_sending_result`: This method receives the result of a transfer from relayer


# Integration

To integrate with the Asterizm Protocol, you need to use the [AsterizmClient](./programs/asterizm-client/src/lib.rs).

This contract already has all the necessary methods for receiving and sending messages to the initializer contract (`receive_message` and `init_send_message`).

You can see the examples of integration in [asterizm-value-example](./programs/asterizm-value-example/src/lib.rs) and [asterizm-token-example](./programs/asterizm-token-example/src/lib.rs).

Here is an example of initiation transfer message:

```rust
pub fn serialize_message_payload_eth(message: MessagePayload) -> Vec<u8> {
    let mut word = [0u8; 96];
    word[..32].copy_from_slice(&message.dst_address.to_bytes());
    word[(64 - 8)..64].copy_from_slice(&message.amount.to_be_bytes());
    word[(96 - 16)..96].copy_from_slice(&message.tx_id.to_be_bytes());
    word.to_vec()
}

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
```

Receive message in target network example:

```rust
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

pub fn receive_message(
    ctx: Context<ReceiveMessage>,
    transfer_hash: [u8; 32],
    src_chain_id: u64,
    src_address: Pubkey,
    tx_id: u128,
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
```
