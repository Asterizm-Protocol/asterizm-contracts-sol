import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import { getPayerFromConfig, tokenClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { ClientAccount } from "../sdk/ts/client/client_account";
import { ClientSender } from "../sdk/ts/client/client_sender";
import { TrustedAddress } from "../sdk/ts/client/trusted_address";
import { ClientMessage } from "../sdk/ts/client/message";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { getSettingsPda } from "../sdk/ts/pda";
import { RELAYER_PROGRAM_ID } from "../sdk/ts/program";

describe("Asterizm client send message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  let payer: null | Keypair = null;
  let systemRelayOwner: null | PublicKey = null;
  let relayOwner: null | PublicKey = null;
  let localChainId: null | BN = null;
  let outgoingTransferHash: null | number[] = null;
  const trustedUserAddress = anchor.web3.Keypair.generate();
  const senderAddress = anchor.web3.Keypair.generate();
  const chainId = new BN(1);
  const txId = new BN(1);
  let srcAddress: null | PublicKey = null;

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    await fundWalletWithSOL(tokenClientOwner.publicKey);
    await fundWalletWithSOL(senderAddress.publicKey);
    const settings = await program.account.relayerSettings.fetch(
      getSettingsPda(RELAYER_PROGRAM_ID)
    );
    systemRelayOwner = settings.systemRelayerOwner;
    relayOwner = payer!.publicKey;
    localChainId = settings.localChainId;
    srcAddress = tokenClientOwner.publicKey;
  });

  it("Create local Client account", async () => {
    const client = new ClientAccount(program.methods);
    await client.create(
      payer!,
      tokenClientOwner.publicKey,
      relayOwner!,
      true,
      true
    );
  });

  it("Create local client account trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(
      tokenClientOwner,
      tokenClientOwner.publicKey,
      trustedUserAddress.publicKey,
      chainId
    );
  });

  it("Create client account sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(
      tokenClientOwner,
      tokenClientOwner.publicKey,
      tokenClientOwner.publicKey
    );
  });

  it("Init Send Message", async () => {
    const message = new ClientMessage(program.methods);

    const payload = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ]);

    const payloadSerialized = serializePayloadEthers({
      dstAddress: trustedUserAddress.publicKey,
      dstChainId: chainId,
      payload,
      srcAddress: srcAddress!,
      srcChainId: localChainId!,
      txId,
    });

    outgoingTransferHash = sha256.array(payloadSerialized);

    await message.initSend(
      tokenClientOwner,
      chainId,
      Buffer.from(payload),
      txId,
      outgoingTransferHash
    );
  });

  it("Send Message", async () => {
    const message = new ClientMessage(program.methods);

    const value = new BN(999);
    const dstAddress = trustedUserAddress.publicKey;

    await message.send(
      tokenClientOwner,
      srcAddress!,
      dstAddress,
      relayOwner!,
      systemRelayOwner!,
      localChainId!,
      chainId,
      txId,
      outgoingTransferHash!,
      value
    );
  });
});
