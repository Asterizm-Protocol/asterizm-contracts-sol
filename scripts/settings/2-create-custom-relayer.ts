import assert from "assert";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AsterizmRelayer } from "../../target/types/asterizm_relayer";
import { getRelayPda, getSettingsPda } from "../../sdk/ts/pda";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { CustomRelay } from "../../sdk/ts/relayer/custom_relay";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const main = async () => {
  const payer = await getPayerFromConfig();

  const response = await prompts([
    {
      type: "text",
      name: "relayOwner",
      message: "Owner of custom relay",
    },
    {
      type: "number",
      name: "fee",
      message: "Relayer fee",
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
  const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
  const relayOwner = new PublicKey(response.relayOwner);

  const init = new CustomRelay(program.methods);
  await init.create(payer!, relayOwner, new BN(response.fee));

  const relayPda = getRelayPda(program.programId, response.relayOwner);
  const relaySettings = await program.account.customRelayer.fetch(relayPda);

  assert.ok(relaySettings.isInitialized == true);
  assert.ok(relaySettings.owner.equals(response.relayOwner));
  assert.ok(relaySettings.fee.eq(new BN(response.fee)));
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
