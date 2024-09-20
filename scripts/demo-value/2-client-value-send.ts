export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import { AsterizmClient } from "../../target/types/asterizm_client";
import BN from "bn.js";
import { ClientMessage } from "../../sdk/ts/client/message";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../../sdk/ts/payload-serializer-ethers";
import { serializeMessagePayloadEthers } from "../../sdk/ts/message-payload-serializer-ethers";
import prompts from "prompts";
import {getPayerFromConfig} from "../../tests/utils/testing";
import {getSettingsPda} from "../../sdk/ts/pda";
import {RELAYER_PROGRAM_ID} from "../../sdk/ts/program";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "dstChainId",
            message: "DST Chain id",
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
            name: "value",
            message: "fee value",
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
            name: "relayOwner",
            message: "relayOwner (relay Owner address)",
        },
        {
            type: "text",
            name: "systemRelayOwner",
            message: "systemRelayOwner (relay Owner address)",
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
    const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;

    const srcAddress = new PublicKey(response.srcAddress);
    const relayOwner = new PublicKey(response.relayOwner);
    const systemRelayOwner = new PublicKey(response.systemRelayOwner);
    const chainId = new BN(response.dstChainId);
    const amount = new BN(response.amount);
    const value = new BN(response.value);
    const txId = new BN(response.txId);
    const relaySettings = await programRelay.account.relayerSettings.fetch(
        getSettingsPda(RELAYER_PROGRAM_ID)
    );
    const srcChainId = relaySettings.localChainId;
    const dstAddress = new PublicKey(response.dstAddress);

    const payload = serializeMessagePayloadEthers({
        to: dstAddress,
        amount,
        txId,
    });

    const payloadSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId: chainId!,
        payload,
        srcAddress,
        srcChainId,
        txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    await (new ClientMessage(program.methods)).send(
        payer,
        srcAddress,
        dstAddress,
        relayOwner!,
        systemRelayOwner!,
        srcChainId,
        chainId,
        txId,
        transferHash,
        value
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
