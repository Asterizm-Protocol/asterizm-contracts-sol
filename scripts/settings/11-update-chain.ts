import assert from "assert";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AsterizmRelayer } from "../../target/types/asterizm_relayer";
import { getChainPda, getSettingsPda } from "../../sdk/ts/pda";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { Chain } from "../../sdk/ts/relayer/chain";
import { BN } from "bn.js";

const main = async () => {
  const payer = await getPayerFromConfig();

  const response = await prompts([
    {
      type: "number",
      name: "id",
      message: "Chain id",
      initial: 0,
    },
    {
      type: "number",
      name: "chainType",
      message: "Chain type: 1 - evm, 2 - tvm, 3 - ton, 4 - solana",
      initial: 1,
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
  const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;

  const init = new Chain(program.methods);
  await init.update(payer!, new BN(response.id), response.chainType);

  const chainPda = getChainPda(program.programId, new BN(response.id));
  const chainSettings = await program.account.chain.fetch(chainPda);

  assert.ok(chainSettings.isInitialized == true);
  assert.ok(chainSettings.chainType == response.chainType);
  assert.ok(chainSettings.id.eq(response.id));
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
