import {serializeNftMessagePayloadEthers} from "../../sdk/ts/nft-message-payload-serializer-ethers";

export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program, EventParser, BorshCoder} from "@coral-xyz/anchor";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {
    getClientAccountPda,
    getTrustedAccountPda,
    getSettingsPda,
    getMintPda
} from "../../sdk/ts/pda";
import BN from "bn.js";
import {
    CLIENT_PROGRAM_ID,
    RELAYER_PROGRAM_ID,
    TOKEN_EXAMPLE_PROGRAM_ID
} from "../../sdk/ts/program";
import {ComputeBudgetProgram, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import {getPayerFromConfig, tokenClientOwner} from "../../tests/utils/testing";
import prompts from "prompts";
import {ClientMessage} from "../../sdk/ts/client/message";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {RelayMessage} from "../../sdk/ts/relayer/message";
import {TokenMessage} from "../../sdk/ts/token/message";
import {AsterizmTokenExample} from "../../target/types/asterizm_token_example";
import {getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
import {serializePayloadEthers, buildCrosschainHash} from "../../sdk/ts/payload-serializer-ethers";
import {sha256} from "js-sha256";
import {serializeMessagePayloadEthers} from "../../sdk/ts/message-payload-serializer-ethers";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "dstChainId",
            message: "DST chain id",
            initial: 40001,
        },
        {
            type: "number",
            name: "amount",
            message: "Tokens amount for transfer to destination chain",
            initial: 1000000000,
        },
        {
            type: "text",
            name: "tokenName",
            message: "Token name",
            initial: 'AsterizmToken1',
        },
        {
            type: "text",
            name: "targetAddress",
            message: "targetAddress (address for sending tokens in destination chain)",
            // initial: "1111111111114UvN6QyVLXZB3iKg2QrfRUUYdVhM",
            initial: "2uM7xmDQMTqYvLLsDCcwQgGVeoTaFoEswwRzEj8Yxfax",
        },
        {
            type: "text",
            name: "srcAddress",
            message: "srcAddress (client address)",
            initial: "FsNa7kiksBmmJtyGjo8MyoQx3rHaSAsq8dFviD8L4Xgr",
        },
        {
            type: "text",
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            // initial: "111111111111dtZTNgYNJ7o2J9oVGYx3n41YEHH",
            initial: "DLwV9Chv99EkjL9jHg5WF8ZZmCW1ct9tuujEsnpGDx7r",
        },
        {
            type: "number",
            name: "feeValue",
            message: "Fee value",
            initial: 100,
        },
        {
            type: "number",
            name: "useCrosschainHash",
            message: "Use crosschain hash (0 - not use, 1 - use)",
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

    const programInternalClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
    const programToken = anchor.workspace.AsterizmTokenExample as Program<AsterizmTokenExample>;


    const srcAddress = new PublicKey(response.srcAddress);
    const targetAddress = new PublicKey(response.targetAddress);
    const dstChainId = new BN(response.dstChainId);
    const amount = new BN(response.amount);
    const dstAddress = new PublicKey(response.dstAddress);
    const useCrosschainHash = response.useCrosschainHash;
    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const clientAccount = await programInternalClient.account.clientAccount.fetch(
        getClientAccountPda(CLIENT_PROGRAM_ID, srcAddress)
    );
    const txId = clientAccount.txId;

    const relaySettings = await programRelay.account.relayerSettings.fetch(
        getSettingsPda(RELAYER_PROGRAM_ID)
    );
    const srcChainId = relaySettings.localChainId;
    const srcTrustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        srcAddress,
        dstChainId
    );
    const dstTrustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        srcChainId
    );





    const mintPda = getMintPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        payer!.publicKey,
        response.tokenName
    );

    const fromAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer!,
        mintPda,
        payer!.publicKey
    ).then((ac) => ac.address);


    const payload = serializeMessagePayloadEthers({
        // to: payer!.publicKey,
        to: targetAddress,
        amount,
        txId,
    });
    const startedPayloadSerialized = serializePayloadEthers({
        dstAddress,
        dstChainId: dstChainId!,
        payload,
        srcAddress,
        srcChainId,
        txId,
    });

    const startedTransferHash = useCrosschainHash == 1 ? buildCrosschainHash(startedPayloadSerialized) : sha256.array(startedPayloadSerialized);

    const sendTokenInstruction = await (new TokenMessage(programToken.methods)).sendInstruction(
        payer!,
        payer!.publicKey,
        dstChainId,
        targetAddress,
        amount,
        response.tokenName,
        mintPda,
        fromAccount,
        startedTransferHash,
        srcTrustedAddressPda
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(sendTokenInstruction);
    tx.feePayer = payer.publicKey;
    let latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer);

    const initTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const InitTx = await anchor.getProvider().connection.getTransaction(initTxHash, {
        commitment: "confirmed",
    });

    let sendTransferHash, sendPayload;
    let ClientEventParser = new EventParser(programInternalClient.programId, new BorshCoder(programInternalClient.idl));
    for (let event of ClientEventParser.parseLogs(InitTx!.meta!.logMessages!)) {
        sendTransferHash = event.data.transferHash;
        sendPayload = event.data.payload;
    }

    // const clientInstruction = await (new ClientMessage(programClient.methods)).sendInstruction(
    //     payer!,
    //     srcAddress,
    //     dstAddress,
    //     payer!.publicKey,
    //     payer!.publicKey,
    //     srcChainId!,
    //     dstChainId,
    //     txId,
    //     sendTransferHash,
    //     new BN (response.feeValue)
    // );
    //
    // tx = new Transaction();
    // tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    // tx.add(clientInstruction);
    // tx.feePayer = payer.publicKey;
    // latestBlockhash = await provider.connection.getLatestBlockhash();
    // tx.recentBlockhash = latestBlockhash.blockhash;
    // tx.sign(payer);
    //
    // const clientTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
    //     commitment: "confirmed",
    // });
    // const clientTx = await anchor.getProvider().connection.getTransaction(clientTxHash, {
    //     commitment: "confirmed",
    // });
    //
    // let relayValue, relayPayload;
    // let RelayEventParser = new EventParser(programRelay.programId, new BorshCoder(programRelay.idl));
    // for (let event of RelayEventParser.parseLogs(clientTx!.meta!.logMessages!)) {
    //     if (event.data.name != 'sendMessageEvent') {
    //         continue;
    //     }
    //
    //     relayValue = event.data.value;
    //     relayPayload = event.data.payload;
    // }
    //
    //
    // const clientInstructionResend = await (new ClientMessage(programClient.methods)).resendInstruction(
    //     payer!,
    //     srcAddress,
    //     payer!.publicKey,
    //     payer!.publicKey,
    //     sendTransferHash,
    //     new BN (response.feeValue)
    // );
    //
    // tx = new Transaction();
    // tx.add(clientInstructionResend);
    // tx.feePayer = payer.publicKey;
    // latestBlockhash = await provider.connection.getLatestBlockhash();
    // tx.recentBlockhash = latestBlockhash.blockhash;
    // tx.sign(payer);
    // await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
    //     commitment: "confirmed",
    // });
    //
    // const relayInstructions = await (new RelayMessage(programRelay.methods)).transferInstruction(
    //     payer!,
    //     payer!.publicKey,
    //     srcChainId,
    //     srcAddress,
    //     dstChainId,
    //     dstAddress,
    //     txId,
    //     sendTransferHash,
    //     clientAccountPda,
    //     dstTrustedAddressPda
    // );
    //
    // tx = new Transaction();
    // tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    // tx.add(relayInstructions);
    // tx.feePayer = payer.publicKey;
    // latestBlockhash = await provider.connection.getLatestBlockhash();
    // tx.recentBlockhash = latestBlockhash.blockhash;
    // tx.sign(payer);
    //
    // const relayTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
    //     commitment: "confirmed",
    // });
    // const relayTx = await anchor.getProvider().connection.getTransaction(relayTxHash, {
    //     commitment: "confirmed",
    // });
    //
    // let eventSrcChainId, eventSrcAddress, eventTxId, eventTransferHash;
    // let DstRelayEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    // for (let event of DstRelayEventParser.parseLogs(relayTx!.meta!.logMessages!)) {
    //     eventSrcChainId = event.data.srcChainId;
    //     eventSrcAddress = event.data.srcAddress;
    //     eventTxId = event.data.txId;
    //     eventTransferHash = event.data.transferHash;
    // }
    //
    //
    //
    // const toAta = await getOrCreateAssociatedTokenAccount(
    //     connection,
    //     payer!,
    //     mintPda,
    //     payer!.publicKey
    // ).then((ac) => ac.address);
    // const clientReceiveInstruction = await (new TokenMessage(programToken.methods)).receiveInstruction(
    //     payer!,
    //     response.tokenName,
    //     eventTransferHash,
    //     srcChainId,
    //     srcAddress,
    //     txId,
    //     Buffer.from(sendPayload),
    //     mintPda,
    //     clientAccountPda,
    //     dstTrustedAddressPda,
    //     dstAddress,
    //     payer!.publicKey,
    //     toAta
    // );
    //
    // tx = new Transaction();
    // tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    // tx.add(clientReceiveInstruction);
    // tx.feePayer = payer.publicKey;
    // latestBlockhash = await provider.connection.getLatestBlockhash();
    // tx.recentBlockhash = latestBlockhash.blockhash;
    // tx.sign(payer);
    //
    // const clientReceiveTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
    //     commitment: "confirmed",
    // });
    // const clientReceiveTx = await anchor.getProvider().connection.getTransaction(clientReceiveTxHash, {
    //     commitment: "confirmed",
    // });
    //
    // let DstClientEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    // for (let event of DstClientEventParser.parseLogs(clientReceiveTx!.meta!.logMessages!)) {
    //     console.log(event);
    // }
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
