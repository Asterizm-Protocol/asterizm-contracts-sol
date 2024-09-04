export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AsterizmValueExample } from "../../target/types/asterizm_value_example";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { InitializeValue } from "../../sdk/ts/value/initialize";

const main = async () => {
  const payer = await getPayerFromConfig();

  const response = await prompts([
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
    .AsterizmValueExample as Program<AsterizmValueExample>;

  const init = new InitializeValue(program.methods);

  await init.createClient(payer);
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
