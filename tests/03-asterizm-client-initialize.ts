import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import assert from "assert";
import {
  getClientAccountPda,
  getSenderAccountPda,
  getSettingsPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { InitializeClient } from "../sdk/ts/client/initialize";
import { ClientAccount } from "../sdk/ts/client/client_account";
import { ClientSender } from "../sdk/ts/client/client_sender";
import { TrustedAddress } from "../sdk/ts/client/trusted_address";

describe("Asterizm client initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  const manager = anchor.web3.Keypair.generate();
  const newManager = anchor.web3.Keypair.generate();
  let payer: null | Keypair = null;
  const clientUserAddress = anchor.web3.Keypair.generate();
  const localChainId = new BN(1000);
  const trustedUserAddress = anchor.web3.Keypair.generate();
  const senderAddress = anchor.web3.Keypair.generate();
  let relayOwner: null | PublicKey = null;
  const chainId = new BN(1);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    await fundWalletWithSOL(manager.publicKey);
    await fundWalletWithSOL(newManager.publicKey);
    await fundWalletWithSOL(clientUserAddress.publicKey);
    await fundWalletWithSOL(senderAddress.publicKey);
    await fundWalletWithSOL(trustedUserAddress.publicKey);
    relayOwner = payer!.publicKey;
  });

  it("Initialize Client settings", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeClient(program.methods);
    await init.initialize(payer!, manager.publicKey, localChainId);
    const settings = await program.account.clientProgramSettings.fetch(
      settingsPda
    );

    assert.ok(settings.isInitialized == true);
    assert.ok(settings.manager.equals(manager.publicKey));
  });

  it("Update Client settings by owner", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeClient(program.methods);
    await init.updateSettings(payer!, newManager.publicKey);
    const settings = await program.account.clientProgramSettings.fetch(
      settingsPda
    );

    assert.ok(settings.manager.equals(newManager.publicKey));
  });

  it("Update Client settings by manager", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeClient(program.methods);
    await init.updateSettings(newManager!, payer!.publicKey);
    const settings = await program.account.clientProgramSettings.fetch(
      settingsPda
    );

    assert.ok(settings.manager.equals(payer!.publicKey));
  });

  it("Create Client account", async () => {
    const client = new ClientAccount(program.methods);
    await client.create(
      payer!,
      clientUserAddress.publicKey,
      relayOwner!,
      true,
      true,
      true,
    );
    const clientAccountPda = getClientAccountPda(
      program.programId,
      clientUserAddress.publicKey
    );
    const clientAccount = await program.account.clientAccount.fetch(
      clientAccountPda
    );

    assert.ok(clientAccount.isInitialized == true);
    assert.ok(clientAccount.relayOwner.equals(relayOwner!));
    assert.ok(clientAccount.notifyTransferSendingResult == true);
    assert.ok(clientAccount.disableHashValidation == true);
  });

  it("Update Client account", async () => {
    const client = new ClientAccount(program.methods);
    await client.update(
      clientUserAddress!,
      clientUserAddress.publicKey,
      relayOwner!,
      false,
      true,
      true,
    );

    const clientAccountPda = getClientAccountPda(
      program.programId,
      clientUserAddress.publicKey
    );
    const clientAccount = await program.account.clientAccount.fetch(
      clientAccountPda
    );

    assert.ok(clientAccount.relayOwner.equals(relayOwner!));
    assert.ok(clientAccount.notifyTransferSendingResult == false);
    assert.ok(clientAccount.disableHashValidation == true);
  });

  it("Create client account trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(
      clientUserAddress,
      clientUserAddress.publicKey,
      trustedUserAddress.publicKey,
      chainId
    );
    const trustedAddressPda = getTrustedAccountPda(
      program.programId,
      clientUserAddress.publicKey,
      chainId
    );
    const trustedAddress = await program.account.clientTrustedAddress.fetch(
      trustedAddressPda
    );

    assert.ok(trustedAddress.isInitialized == true);
    assert.ok(trustedAddress.userAddress.equals(clientUserAddress.publicKey));
    assert.ok(trustedAddress.address.equals(trustedUserAddress.publicKey));
    assert.ok(trustedAddress.chainId.eq(chainId));
  });

  it("Remove Client account trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.remove(
      clientUserAddress,
      clientUserAddress.publicKey,
      chainId
    );
    const trustedAddressPda = getTrustedAccountPda(
      program.programId,
      clientUserAddress.publicKey,
      chainId
    );
    const trustedAddress =
      await program.account.clientTrustedAddress.fetchNullable(
        trustedAddressPda
      );
    assert.ok(trustedAddress == null);
  });

  it("Create client account sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(
      clientUserAddress,
      clientUserAddress.publicKey,
      trustedUserAddress.publicKey
    );
    const senderAddressPda = getSenderAccountPda(
      program.programId,
      clientUserAddress.publicKey,
      trustedUserAddress.publicKey
    );
    const senderAddress = await program.account.clientSender.fetch(
      senderAddressPda
    );

    assert.ok((senderAddress.isInitialized = true));
    assert.ok(senderAddress.address.equals(trustedUserAddress.publicKey));
    assert.ok(senderAddress.userAddress.equals(clientUserAddress.publicKey));
  });

  it("Remove Client account sender", async () => {
    const client = new ClientSender(program.methods);
    await client.remove(
      clientUserAddress,
      clientUserAddress.publicKey,
      trustedUserAddress.publicKey
    );
    const senderAddressPda = getSenderAccountPda(
      program.programId,
      clientUserAddress.publicKey,
      trustedUserAddress.publicKey
    );
    const senderAddress =
      await program.account.clientTrustedAddress.fetchNullable(
        senderAddressPda
      );
    assert.ok(senderAddress == null);
  });
});
