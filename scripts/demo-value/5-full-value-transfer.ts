export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program, EventParser, BorshCoder} from "@coral-xyz/anchor";
import { AsterizmValueExample } from "../../target/types/asterizm_value_example";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {getClientAccountPda, getTrustedAccountPda, getSettingsPda} from "../../sdk/ts/pda";
import BN from "bn.js";
import {CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID} from "../../sdk/ts/program";
import { ValueMessage } from "../../sdk/ts/value/message";
import {ComputeBudgetProgram, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import {getPayerFromConfig} from "../../tests/utils/testing";
import prompts from "prompts";
import {ClientMessage} from "../../sdk/ts/client/message";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {RelayMessage} from "../../sdk/ts/relayer/message";
import {serializePayloadEthers} from "../../sdk/ts/payload-serializer-ethers";
import {sha256} from "js-sha256";
import {serializeValueMessagePayloadEthers} from "../../sdk/ts/value-message-payload-serializer-ethers";

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
            message: "Amount for transfer to destination chain",
            initial: 1000000,
        },
        {
            type: "text",
            name: "srcAddress",
            message: "srcAddress (client address)",
            initial: "7whpo6vfw7adGJ67SfZYQeNqTbHRko9M4phJbzWZiqAs",
        },
        {
            type: "text",
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            initial: "7whpo6vfw7adGJ67SfZYQeNqTbHRko9M4phJbzWZiqAs",
        },
        {
            type: "number",
            name: "feeValue",
            message: "Fee value",
            initial: 100,
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

    const programValue = anchor.workspace.AsterizmValueExample as Program<AsterizmValueExample>;
    const programInternalClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;


    const srcAddress = new PublicKey(response.srcAddress);
    const dstChainId = new BN(response.dstChainId);
    const amount = new BN(response.amount);
    const dstAddress = new PublicKey(response.dstAddress);
    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        srcAddress,
        dstChainId
    );
    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const clientAccount = await programInternalClient.account.clientAccount.fetch(
        getClientAccountPda(CLIENT_PROGRAM_ID, srcAddress)
    );
    const txId = clientAccount.txId;

    const relaySettings = await programRelay.account.relayerSettings.fetch(
        getSettingsPda(RELAYER_PROGRAM_ID)
    );
    const srcChainId = relaySettings.localChainId;



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

    const instructionValue = await (new ValueMessage(programValue.methods)).send(
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
    tx.add(instructionValue);
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

    let transferHash, payload;
    let ClientEventParser = new EventParser(programInternalClient.programId, new BorshCoder(programInternalClient.idl));
    for (let event of ClientEventParser.parseLogs(InitTx!.meta!.logMessages!)) {
        transferHash = event.data.transferHash;
        payload = event.data.payload;
    }


    const clientInstruction = await (new ClientMessage(programClient.methods)).sendInstruction(
        payer!,
        srcAddress,
        dstAddress,
        payer!.publicKey,
        payer!.publicKey,
        srcChainId,
        dstChainId,
        txId,
        transferHash,
        new BN (response.feeValue)
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(clientInstruction);
    tx.feePayer = payer.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer);

    const clientTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const clientTx = await anchor.getProvider().connection.getTransaction(clientTxHash, {
        commitment: "confirmed",
    });

    let relayValue, relayPayload;
    let RelayEventParser = new EventParser(programRelay.programId, new BorshCoder(programRelay.idl));
    for (let event of RelayEventParser.parseLogs(clientTx!.meta!.logMessages!)) {
        if (event.data.name != 'sendMessageEvent') {
            continue;
        }

        relayValue = event.data.value;
        relayPayload = event.data.payload;
    }



    const relayInstructions = await (new RelayMessage(programRelay.methods)).transferInstruction(
        payer!,
        payer!.publicKey,
        srcChainId,
        srcAddress,
        dstChainId,
        dstAddress,
        txId,
        transferHash,
        clientAccountPda,
        trustedAddressPda
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(relayInstructions);
    tx.feePayer = payer.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer);

    const relayTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const relayTx = await anchor.getProvider().connection.getTransaction(relayTxHash, {
        commitment: "confirmed",
    });

    let eventSrcChainId, eventSrcAddress, eventTxId, eventTransferHash;
    let DstClientEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    for (let event of DstClientEventParser.parseLogs(relayTx!.meta!.logMessages!)) {
        eventSrcChainId = event.data.srcChainId;
        eventSrcAddress = event.data.srcAddress;
        eventTxId = event.data.txId;
        eventTransferHash = event.data.transferHash;
    }




    const dstClientInstructions = await (new ValueMessage(programValue.methods)).receiveInstruction(
        payer!,
        eventTransferHash,
        eventSrcChainId,
        eventSrcAddress,
        eventTxId,
        payload,
        clientAccountPda,
        trustedAddressPda,
        dstAddress
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(dstClientInstructions);
    tx.feePayer = payer.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer);

    const dstClientTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const dstClientTx = await anchor.getProvider().connection.getTransaction(dstClientTxHash, {
        commitment: "confirmed",
    });

    let DstClientReceiveEventParser = new EventParser(programInternalClient.programId, new BorshCoder(programInternalClient.idl));
    for (let event of DstClientReceiveEventParser.parseLogs(dstClientTx!.meta!.logMessages!)) {
        console.log(event);
    }
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
