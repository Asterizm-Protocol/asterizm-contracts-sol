export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import { AsterizmValueExample } from "../../target/types/asterizm_value_example";
import {getSettingsPda, getTrustedAccountPda} from "../../sdk/ts/pda";
import BN from "bn.js";
import {CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID} from "../../sdk/ts/program";
import { ValueMessage } from "../../sdk/ts/value/message";
import {ComputeBudgetProgram, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import {getPayerFromConfig} from "../../tests/utils/testing";
import prompts from "prompts";
import {serializeValueMessagePayloadEthers} from "../../sdk/ts/value-message-payload-serializer-ethers";
import {serializePayloadEthers} from "../../sdk/ts/payload-serializer-ethers";
import {sha256} from "js-sha256";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";

const main = async () => {
  const payer = await getPayerFromConfig();

  const response = await prompts([
    {
      type: "number",
      name: "dstChainId",
      message: "DST chain id",
      initial: 50001,
    },
    {
      type: "number",
      name: "amount",
      message: "amount",
      initial: 0,
    },
    {
      type: "number",
      name: "txId",
      message: "txId",
      initial: 0,
    },
    {
      type: "text",
      name: "srcAddress",
      message: "srcAddress (client address)",
    },
    {
      type: "text",
      name: "dstAddress",
      message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
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
  const program = anchor.workspace.AsterizmValueExample as Program<AsterizmValueExample>;
  const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;

  const srcAddress = new PublicKey(response.srcAddress);
  const dstChainId = new BN(response.dstChainId);
  const amount = new BN(response.amount);
  const txId = new BN(response.txId);
  const relaySettings = await programRelay.account.relayerSettings.fetch(
      getSettingsPda(RELAYER_PROGRAM_ID)
  );
  const srcChainId = relaySettings.localChainId;

  const dstAddress = new PublicKey(response.dstAddress);
  const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      dstChainId
  );


  const startPayload = serializeValueMessagePayloadEthers({
    to: dstAddress,
    amount,
    txId,
  });
  const startedPayloadSerialized = serializePayloadEthers({
    dstAddress,
    dstChainId: dstChainId!,
    payload: startPayload,
    srcAddress,
    srcChainId,
    txId,
  });

  const startedTransferHash = sha256.array(startedPayloadSerialized);
  const instruction = await (new ValueMessage(program.methods)).send(
      payer,
      srcAddress,
      dstChainId,
      dstAddress,
      amount,
      startedTransferHash,
      trustedAddressPda
  );

  let tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
  tx.add(instruction);
  tx.feePayer = payer.publicKey;
  const latestBlockhash = await provider.connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.sign(payer);

  await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
    commitment: "confirmed",
  });
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
