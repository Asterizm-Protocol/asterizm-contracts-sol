import assert from "assert";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AsterizmInitializer } from "../../target/types/asterizm_initializer";
import { getSettingsPda } from "../../sdk/ts/pda";
import { getPayerFromConfig } from "../../tests/utils/testing";
import { InitializeInitializer } from "../../sdk/ts/initializer/initialize";
import { BN } from "bn.js";

import prompts from "prompts";
import { PublicKey } from "@solana/web3.js";

const main = async () => {
  const payer = await getPayerFromConfig();

  const response = await prompts([
    {
      type: "text",
      name: "manager",
      message: "Initial manager for initializer",
    },
    {
      type: "number",
      name: "localChainId",
      message: "localChainId",
      initial: 0,
    },
    {
      type: "text",
      name: "endpoint",
      message: "Solana Endpoint",
      initial: "https://api.devnet.solana.com/",
    },
  ]);

  const connection = new anchor.web3.Connection(response.endpoint);
  const wallet = new anchor.Wallet(payer);
  const provider = new AnchorProvider(connection, wallet);
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmInitializer as Program<AsterizmInitializer>;

  const manager = new PublicKey(response.manager);

  const settingsPda = getSettingsPda(program.programId);
  const init = new InitializeInitializer(program.methods);
  await init.initialize(payer!, manager, new BN(response.localChainId));

  const settings = await program.account.relayerSettings.fetch(settingsPda);

  assert.ok(settings.isInitialized == true);
  assert.ok(settings.manager.equals(response.manager));
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
