import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmInitializer } from "../target/types/asterizm_initializer";
import assert from "assert";
import {
  getSettingsPda,
  getBlockedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, shouldFail } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { InitializeInitializer } from "../sdk/ts/initializer/initialize";
import { InitializerMessage } from "../sdk/ts/initializer/message";
import { RELAYER_PROGRAM_ID } from "../sdk/ts/program";
import { InitializerBlockedAccounts } from "../sdk/ts/initializer/block_account";

describe("Asterizm initializer initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmInitializer as Program<AsterizmInitializer>;
  const manager = anchor.web3.Keypair.generate();
  const newManager = anchor.web3.Keypair.generate();
  let payer: null | Keypair = null;
  const systemRelayOwner = anchor.web3.Keypair.generate();
  const localChainId = new BN(1000);
  const chainId = new BN(1);
  const blockedUserAddress = anchor.web3.Keypair.generate().publicKey;

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    await fundWalletWithSOL(manager.publicKey);
    await fundWalletWithSOL(newManager.publicKey);
    await fundWalletWithSOL(systemRelayOwner.publicKey);
  });

  it("Initialize Initializer settings", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeInitializer(program.methods);
    await init.initialize(payer!, manager.publicKey, localChainId);
    const settings = await program.account.initializerSettings.fetch(
      settingsPda
    );

    assert.ok(settings.isInitialized == true);
    assert.ok(settings.manager.equals(manager.publicKey));
  });

  it("Update Initializer settings by owner", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeInitializer(program.methods);
    await init.updateSettings(payer!, newManager.publicKey);
    const settings = await program.account.initializerSettings.fetch(
      settingsPda
    );

    assert.ok(settings.manager.equals(newManager.publicKey));
  });

  it("Update Initializer settings by manager", async () => {
    const settingsPda = getSettingsPda(program.programId);
    const init = new InitializeInitializer(program.methods);
    await init.updateSettings(newManager!, newManager.publicKey);
    const settings = await program.account.initializerSettings.fetch(
      settingsPda
    );

    assert.ok(settings.manager.equals(newManager.publicKey));
  });

  it("Block account", async () => {
    const init = new InitializerBlockedAccounts(program.methods);
    await init.blockAccount(newManager!, chainId, blockedUserAddress);
    const blockedAccountPda = getBlockedAccountPda(
      program.programId,
      chainId,
      blockedUserAddress
    );
    const blockedAccount = await program.account.blockedAccount.fetch(
      blockedAccountPda
    );

    assert.ok((blockedAccount.isBlocked = true));
  });

  it("Send Message", async () => {
    const message = new InitializerMessage(program.methods);
    const srcAddress = anchor.web3.Keypair.generate().publicKey;
    const dstAddress = anchor.web3.Keypair.generate().publicKey;
    const txId = new BN(0);
    const transferResultNotifyFlag = true;
    const transferHash = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ];
    const value = new BN(123);

    const settingsPda = getSettingsPda(RELAYER_PROGRAM_ID);
    const settings = await program.account.relayerSettings.fetch(settingsPda);
    const systemRelayOwner = settings.systemRelayerOwner;

    return shouldFail(
      () =>
        message.send(
          payer!,
          systemRelayOwner,
          systemRelayOwner,
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
