import { PublicKey } from "@solana/web3.js";

export { };

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
    getClientAccountPda,
    getTrustedAccountPda,
    getSettingsPda,
} from "../../sdk/ts/pda";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID } from "../../sdk/ts/program";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmRelayer } from "../../target/types/asterizm_relayer";
import { TokenMessage } from "../../sdk/ts/native_token/message";
import { AsterizmNativeTokenExample } from "../../target/types/asterizm_native_token_example";
import { serializeMessagePayloadEthers } from "../../sdk/ts/message-payload-serializer-ethers";
import { serializePayloadEthers } from "../../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { RelayMessage } from "../../sdk/ts/relayer/message";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "srcChainId",
            message: "SRC chain id",
            initial: 50001,
        },
        {
            type: "number",
            name: "txId",
            message: "Ix ID",
            initial: 10,
        },
        {
            type: "number",
            name: "amount",
            message: "Tokens amount for transfer to destination chain",
            initial: 0,
        },
        {
            type: "text",
            name: "tokenName",
            message: "Token name",
            initial: 'AsterizmToken',
        },
        {
            type: "text",
            name: "mintAddress",
            message: "Mint address",
            initial: '0',
        },
        {
            type: "text",
            name: "srcAddress",
            message: "srcAddress (client address)",
            initial: "Ab7yDn45BrURbc81GmCtd1bggEfR6p5Qn4TSM6tT6Cfk",
        },
        {
            type: "text",
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            initial: "Ab7yDn45BrURbc81GmCtd1bggEfR6p5Qn4TSM6tT6Cfk",
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

    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
    const programToken = anchor.workspace.AsterizmNativeTokenExample as Program<AsterizmNativeTokenExample>;


    const srcAddress = new PublicKey(response.srcAddress);
    const srcChainId = new BN(response.srcChainId);
    const amount = new BN(response.amount);
    const dstAddress = new PublicKey(response.dstAddress);
    const mint = new PublicKey(response.mintAddress);
    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        srcChainId
    );
    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);
    const txId = new BN(response.txId);
    const relaySettings = await programRelay.account.relayerSettings.fetch(
        getSettingsPda(RELAYER_PROGRAM_ID)
    );
    const dstChainId = relaySettings.localChainId;

    let payloadRelay = serializeMessagePayloadEthers({
        to: payer!.publicKey,
        amount,
        txId,
    });

    let payloadSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId: dstChainId!,
        payload: payloadRelay,
        srcAddress,
        srcChainId: srcChainId!,
        txId: txId,
    });

    const incomingTransferHash = sha256.array(payloadSerialized);

    const messageRelay = new RelayMessage(programRelay.methods);
    await messageRelay.transfer(
        payer!,
        payer!.publicKey,
        srcChainId,
        srcAddress,
        dstChainId,
        dstAddress,
        txId,
        incomingTransferHash,
        clientAccountPda,
        trustedAddressPda
    );

    const payloadClient = serializeMessagePayloadEthers({
        to: payer!.publicKey,
        amount,
        txId,
    });

    const payloadClientSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId: dstChainId!,
        payload: payloadClient,
        srcAddress,
        srcChainId: srcChainId!,
        txId: txId,
    });

    const transferHash = sha256.array(payloadClientSerialized);
    const toAta = await getOrCreateAssociatedTokenAccount(
        connection,
        payer!,
        mint,
        payer!.publicKey
    ).then((ac) => ac.address);


    const messageTokenReceive = new TokenMessage(programToken.methods);
    await messageTokenReceive.receive(
        payer!,
        response.tokenName,
        transferHash,
        srcChainId,
        srcAddress,
        txId,
        Buffer.from(payloadClient),
        mint,
        clientAccountPda,
        trustedAddressPda,
        dstAddress,
        payer!.publicKey,
        toAta
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
