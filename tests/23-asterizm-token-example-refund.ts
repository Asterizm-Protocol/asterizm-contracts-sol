import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmTokenExample } from "../target/types/asterizm_token_example";
import {
  getMintPda,
  getTokenClientAccountPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, tokenClientOwner } from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { TokenMessage } from "../sdk/ts/token/message";
import assert from "assert";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { Refund } from "../sdk/ts/token/refund";

describe("Asterizm token example refund tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmTokenExample as Program<AsterizmTokenExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const name = "asterizm";
  const amount = new BN(1);
  const localChainId = new BN(1000);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
  });

  it("Send init Message", async () => {
    const message = new TokenMessage(program.methods);
    const srcAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const tokenClientAccount = await program.account.tokenClientAccount.fetch(
        srcAddress
    );

    const txId = tokenClientAccount.txId;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const mintPda = getMintPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      tokenClientOwner.publicKey,
      name
    );

    const from = await resolveAssociatedTokenAccount(mintPda, payer!);

    const payload = serializeMessagePayloadEthers({
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

    await message.send(
      payer!,
      tokenClientOwner.publicKey,
      chainId,
      dstAddress,
      amount,
      name,
      mintPda,
      from,
      transferHash,
      trustedAddressPda
    );

    const from_balance = await getTokenAccountBalance(from);

    assert.ok(from_balance == "0");
  });

  it("Add Refund Request", async () => {
    const refund = new Refund(program.methods);
    const srcAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const tokenClientAccount = await program.account.tokenClientAccount.fetch(
        srcAddress
    );

    const txId: BN = new BN(tokenClientAccount.txId).sub(new BN(1));

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const mintPda = getMintPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      tokenClientOwner.publicKey,
      name
    );

    const from = await resolveAssociatedTokenAccount(mintPda, payer!);

    const payload = serializeMessagePayloadEthers({
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

    await refund.addRefundRequest(
      payer!,
      tokenClientOwner.publicKey,
      name,
      transferHash,
    );

  });

  it("Process Refund Request", async () => {
    const refund = new Refund(program.methods);
    const srcAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const tokenClientAccount = await program.account.tokenClientAccount.fetch(
        srcAddress
    );

    const txId: BN = new BN(tokenClientAccount.txId).sub(new BN(1));

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const mintPda = getMintPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      tokenClientOwner.publicKey,
      name
    );

    const from = await resolveAssociatedTokenAccount(mintPda, payer!);

    const payload = serializeMessagePayloadEthers({
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

    const status = true;

    await refund.processRefundRequest(
      tokenClientOwner!,
      tokenClientOwner.publicKey,
      name,
      transferHash,
      status,
      mintPda,
      payer!.publicKey,
      from,
    );

    const from_balance = await getTokenAccountBalance(from);

    assert.ok(from_balance == "1");

  });
});
