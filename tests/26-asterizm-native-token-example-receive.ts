import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmNativeTokenExample } from "../target/types/asterizm_native_token_example";
import {
  getClientAccountPda,
  getTokenClientAccountPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, nativeTokenClientOwner, nativeTokenMint } from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, NATIVE_TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { TokenMessage } from "../sdk/ts/native_token/message";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import assert from "assert";

describe("Asterizm native token example receive message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmNativeTokenExample as Program<AsterizmNativeTokenExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const localChainId = new BN(1000);
  const name = "asterizm";
  const txId = new BN(3);
  const amount = new BN(999);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(nativeTokenClientOwner.publicKey);
  });

  it("Receive Message", async () => {
    const message = new TokenMessage(program.methods);
    const dstAddress = getTokenClientAccountPda(
        NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
        nativeTokenClientOwner.publicKey,
        name
    );
    const to = payer!.publicKey;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const srcAddress = clientTrustedAddress.address;

    const payload = serializeMessagePayloadEthers({
      to,
      amount,
      txId,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: localChainId!,
      payload,
      srcAddress,
      srcChainId: chainId!,
      txId: txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const toAta = await resolveAssociatedTokenAccount(nativeTokenMint.publicKey, payer!);

    await message.receive(
      nativeTokenClientOwner,
      name,
      transferHash,
      chainId,
      srcAddress,
      txId,
      Buffer.from(payload),
      nativeTokenMint.publicKey,
      clientAccountPda,
      trustedAddressPda,
      dstAddress,
      to,
      toAta
    );

    const to_balance = await getTokenAccountBalance(toAta);

    assert.ok(to_balance == amount.toString());
  });
});
