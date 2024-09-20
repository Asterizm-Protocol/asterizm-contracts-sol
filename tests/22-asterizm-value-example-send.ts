import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmValueExample } from "../target/types/asterizm_value_example";
import { getTrustedAccountPda } from "../sdk/ts/pda";
import { valueClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID } from "../sdk/ts/program";
import { ValueMessage } from "../sdk/ts/value/message";
import {ComputeBudgetProgram, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import { serializeValueMessagePayloadEthers } from "../sdk/ts/value-message-payload-serializer-ethers";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";

describe("Asterizm value example init send message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmValueExample as Program<AsterizmValueExample>;
  const chainId = new BN(1);
  const amount = new BN(999);
  const txId = new BN(0);
  const localChainId = new BN(1000);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    await fundWalletWithSOL(valueClientOwner.publicKey);
  });

  it("Send init Message", async () => {
    const message = new ValueMessage(program.methods);
    const srcAddress = valueClientOwner.publicKey;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const payload = serializeValueMessagePayloadEthers({
      to: dstAddress,
      amount,
      txId,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: chainId!,
      payload,
      srcAddress,
      srcChainId: localChainId!,
      txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const instruction = await message.send(
        valueClientOwner,
        srcAddress,
        chainId,
        dstAddress,
        amount,
        transferHash,
        trustedAddressPda
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instruction);
    tx.feePayer = valueClientOwner.publicKey;
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(valueClientOwner);

    await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
      commitment: "confirmed",
    });

  });
});
