import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmRelayer } from "../target/types/asterizm_relayer";
import {getClientAccountPda, getIncomingTransferAccountPda, getTokenClientAccountPda} from "../sdk/ts/pda";
import {getPayerFromConfig, tokenClientOwner, trustedUserAddress} from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, sendAndConfirmRawTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { RelayMessage } from "../sdk/ts/relayer/message";
import {CLIENT_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID} from "../sdk/ts/program";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";

describe("Asterizm relayer transfer message for token example", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
  let payer: null | Keypair = null;
  const localChainId = new BN(1000);
  const chainId = new BN(1);
  const txId = new BN(3);
  const amount = new BN(999);
  const name = "asterizm";

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
  });

  it("Transfer Message", async () => {
    const message = new RelayMessage(program.methods);
    const dstAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const to = payer!.publicKey;

    const payload = serializeMessagePayloadEthers({
      to,
      amount,
      txId,
    });

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const srcAddress = trustedUserAddress.publicKey;

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: localChainId!,
      payload,
      srcAddress,
      srcChainId: chainId!,
      txId: txId,
    });

    const incomingTransferHash = sha256.array(payloadSerialized);


    const clientTransferAccountPda = getIncomingTransferAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        incomingTransferHash
    );

    let tx = new Transaction();
    tx.add( SystemProgram.transfer({
      fromPubkey: payer!.publicKey,
      toPubkey: clientTransferAccountPda,
      lamports: 1_000_000,
    }));
    tx.feePayer = payer!.publicKey;
    let latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer!);

    const clientTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
      commitment: "confirmed",
    });
    const clientTx = await anchor.getProvider().connection.getTransaction(clientTxHash, {
      commitment: "confirmed",
    });


    await message.transfer(
        payer!,
        payer!.publicKey,
        chainId,
        srcAddress,
        localChainId,
        dstAddress,
        txId,
        incomingTransferHash,
        clientAccountPda,
    );
  });
});
