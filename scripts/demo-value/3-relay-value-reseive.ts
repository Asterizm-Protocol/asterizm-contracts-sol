export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import BN from "bn.js";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../../sdk/ts/payload-serializer-ethers";
import { serializeValueMessagePayloadEthers } from "../../sdk/ts/value-message-payload-serializer-ethers";

import prompts from "prompts";
import {getPayerFromConfig} from "../../tests/utils/testing";
import {RelayMessage} from "../../sdk/ts/relayer/message";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {getClientAccountPda, getSettingsPda, getTrustedAccountPda} from "../../sdk/ts/pda";
import {CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID} from "../../sdk/ts/program";

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
    const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;

    const message = new RelayMessage(program.methods);

    const srcAddress = new PublicKey(response.srcAddress);
    const dstChainId = new BN(response.dstChainId);
    const amount = new BN(response.amount);
    const txId = new BN(response.txId);
    const relaySettings = await programRelay.account.relayerSettings.fetch(
        getSettingsPda(RELAYER_PROGRAM_ID)
    );
    const srcChainId = relaySettings.localChainId;
    const dstAddress = new PublicKey(response.dstAddress);

    const payload = serializeValueMessagePayloadEthers({
        to: dstAddress,
        amount,
        txId,
    });

    const payloadSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId,
        payload,
        srcAddress,
        srcChainId,
        txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);
    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        dstChainId
    );

    await message.transfer(
        payer!,
        payer!.publicKey,
        dstChainId,
        srcAddress,
        srcChainId,
        dstAddress,
        txId,
        transferHash,
        clientAccountPda,
        trustedAddressPda
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
