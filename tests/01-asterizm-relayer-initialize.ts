import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmRelayer } from "../target/types/asterizm_relayer";
import assert from "assert";
import { getRelayPda, getSettingsPda, getChainPda } from "../sdk/ts/pda";
import { getPayerFromConfig, shouldFail } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { InitializeRelay } from "../sdk/ts/relayer/initialize";
import { Keypair } from "@solana/web3.js";
import { CustomRelay } from "../sdk/ts/relayer/custom_relay";
import BN from "bn.js";
import { Chain } from "../sdk/ts/relayer/chain";
import { RelayMessage } from "../sdk/ts/relayer/message";

describe("Asterizm relayer initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
  const manager = anchor.web3.Keypair.generate();
  const newManager = anchor.web3.Keypair.generate();
  let payer: null | Keypair = null;
  const systemRelayOwner = anchor.web3.Keypair.generate();
  const systemRelayFee = new BN(111);
  const customRelayFee = new BN(123);
  const localChainId = new BN(1000);
  const chainId = new BN(1);
  const chainName = "Ethereum";
  const chainType = 1;

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    await fundWalletWithSOL(manager.publicKey);
    await fundWalletWithSOL(newManager.publicKey);
    await fundWalletWithSOL(systemRelayOwner.publicKey);
  });

  it("Initialize Relayer settings", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeRelay(program.methods);
    await init.initialize(
      payer!,
      systemRelayOwner.publicKey,
      manager.publicKey,
      systemRelayFee,
      localChainId
    );
    const settings = await program.account.relayerSettings.fetch(settingsPda);

    assert.ok(settings.isInitialized == true);
    assert.ok(settings.manager.equals(manager.publicKey));
  });

  it("Update Relayer settings by owner", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeRelay(program.methods);
    await init.updateSettings(payer!, newManager.publicKey, systemRelayFee);
    const settings = await program.account.relayerSettings.fetch(settingsPda);

    assert.ok(settings.manager.equals(newManager.publicKey));
  });

  it("Update Relayer settings by manager", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeRelay(program.methods);
    await init.updateSettings(
      newManager!,
      newManager.publicKey,
      systemRelayFee
    );
    const settings = await program.account.relayerSettings.fetch(settingsPda);

    assert.ok(settings.manager.equals(newManager.publicKey));
  });

  it("Create custom Relayer settings", async () => {
    const customRelay = new CustomRelay(program.methods);
    await customRelay.create(newManager!, payer!.publicKey, customRelayFee);
    const relayPda = getRelayPda(program.programId, payer!.publicKey);
    const relaySettings = await program.account.customRelayer.fetch(relayPda);

    assert.ok(relaySettings.isInitialized == true);
    assert.ok(relaySettings.owner.equals(payer!.publicKey));
    assert.ok(relaySettings.fee.eq(customRelayFee));
  });

  it("Update custom Relayer settings by manager", async () => {
    const newCustomRelayFee = new BN(321);
    const customRelay = new CustomRelay(program.methods);
    await customRelay.update(newManager!, payer!.publicKey, newCustomRelayFee);
    const relayPda = getRelayPda(program.programId, payer!.publicKey);
    const relaySettings = await program.account.customRelayer.fetch(relayPda);

    assert.ok(relaySettings.fee.eq(newCustomRelayFee));
  });

  it("Update custom Relayer settings by relay owner", async () => {
    const newCustomRelayFee = new BN(345);
    const customRelay = new CustomRelay(program.methods);
    await customRelay.update(payer!, payer!.publicKey, newCustomRelayFee);
    const relayPda = getRelayPda(program.programId, payer!.publicKey);
    const relaySettings = await program.account.customRelayer.fetch(relayPda);

    assert.ok(relaySettings.fee.eq(newCustomRelayFee));
  });

  it("Create chain", async () => {
    const chain = new Chain(program.methods);
    await chain.create(newManager!, chainId, chainName, chainType);
    const chainPda = getChainPda(program.programId, chainId);
    const chainSettings = await program.account.chain.fetch(chainPda);

    assert.ok(chainSettings.isInitialized == true);
    assert.ok(chainSettings.name == chainName);
    assert.ok(chainSettings.id.eq(chainId));
  });

  it("Send Message", async () => {
    const message = new RelayMessage(program.methods);
    const srcAddress = anchor.web3.Keypair.generate().publicKey;
    const dstAddress = anchor.web3.Keypair.generate().publicKey;
    const txId = 0;
    const transferResultNotifyFlag = true;
    const transferHash = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ];
    const value = new BN(123);

    return shouldFail(
      () =>
        message.send(
          payer!,
          systemRelayOwner.publicKey,
          chainId,
          srcAddress,
          dstAddress,
          txId,
          transferResultNotifyFlag,
          transferHash,
          value
        ),
      "ProgramError occurred. Error Code: IncorrectProgramId"
    );
  });
});
