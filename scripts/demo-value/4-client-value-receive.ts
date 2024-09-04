export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import BN from "bn.js";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../../sdk/ts/payload-serializer-ethers";
import prompts from "prompts";
import {getPayerFromConfig} from "../../tests/utils/testing";
import {getClientAccountPda, getTrustedAccountPda} from "../../sdk/ts/pda";
import {CLIENT_PROGRAM_ID} from "../../sdk/ts/program";
import {ValueMessage} from "../../sdk/ts/value/message";
import {AsterizmValueExample} from "../../target/types/asterizm_value_example";
import {serializeValueMessagePayloadEthers} from "../../sdk/ts/value-message-payload-serializer-ethers";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "srcChainId",
            message: "SRC Chain id",
            initial: 50001,
        },
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

    const txId = response.txId;
    const amount = new BN (response.amount);
    const srcChainId = new BN (response.srcChainId);
    const dstChainId = new BN (response.dstChainId);

    const dstAddress = new PublicKey(response.dstAddress);
    const to = payer!.publicKey;

    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        dstChainId
    );

    const srcAddress = new PublicKey(response.srcAddress);

    const payload = serializeValueMessagePayloadEthers({
        to,
        amount,
        txId,
    });

    const payloadSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId: dstChainId!,
        payload,
        srcAddress,
        srcChainId: srcChainId!,
        txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    await (new ValueMessage(program.methods)).receive(
        payer!,
        transferHash,
        srcChainId!,
        srcAddress,
        txId,
        Buffer.from(payload),
        clientAccountPda,
        trustedAddressPda,
        dstAddress
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
