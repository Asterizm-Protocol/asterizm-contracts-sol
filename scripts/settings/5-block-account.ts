import { PublicKey } from "@solana/web3.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AsterizmInitializer } from "../../target/types/asterizm_initializer";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { InitializerBlockedAccounts } from "../../sdk/ts/initializer/block_account";
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
      type: "text",
      name: "address",
      message: "address",
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

  const block = new InitializerBlockedAccounts(program.methods);
  const address = new PublicKey(response.address);
  await block.blockAccount(payer!, new BN(response.id), address);
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
