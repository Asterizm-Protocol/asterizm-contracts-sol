
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
import {getPayerFromConfig} from "../../tests/utils/testing";
import prompts from "prompts";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {TokenMessage} from "../../sdk/ts/token/message";
import {AsterizmTokenExample} from "../../target/types/asterizm_token_example";
import {getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
import {serializePayloadEthers} from "../../sdk/ts/payload-serializer-ethers";
import {sha256} from "js-sha256";
import {serializeMessagePayloadEthers} from "../../sdk/ts/message-payload-serializer-ethers";
import { Refund } from "../../sdk/ts/token/refund";
import { calculateFees, FEE_RATES } from "../../tests/utils/fees";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "dstChainId",
            message: "DST chain id",
            initial: 11155111,
        },
        {
            type: "number",
            name: "amount",
            message: "Tokens amount for transfer to destination chain",
            initial: 10,
        },
        {
            type: "text",
            name: "tokenName",
            message: "Token name",
            initial: 'AsterizmToken3',
        },
        {
            type: "text",
            name: "targetAddress",
            message: "targetAddress (address for sending tokens in destination chain)",
            initial: "7whpo6vfw7adGJ67SfZYQeNqTbHRko9M4phJbzWZiqAs",
        },
        {
            type: "text",
            name: "srcAddress",
            message: "srcAddress (client address)",
            initial: "3hQD997qouSMx2TMPNGQCZk4NE3yEksCi3v4A9S2Nyjh",
        },
        {
            type: "text",
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            initial: "1111111111114MaFcXR65rueYpZ3fvikn5V2JEi7",
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

    const programInternalClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
    const programToken = anchor.workspace.AsterizmTokenExample as Program<AsterizmTokenExample>;


    const srcAddress = new PublicKey(response.srcAddress);
    const targetAddress = new PublicKey(response.targetAddress);
    const dstChainId = new BN(response.dstChainId);
    const amount = new BN(response.amount);
    const dstAddress = new PublicKey(response.dstAddress);

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
    const mintPda = getMintPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        targetAddress,
        response.tokenName
    );

    const fromAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer!,
        mintPda,
        payer!.publicKey
    ).then((ac) => ac.address);

    const { ownerFee, systemFee, netAmount } = calculateFees(
        amount,
        FEE_RATES.OWNER_FEE_RATE,
        FEE_RATES.SYSTEM_FEE_RATE
    );

    const payload = serializeMessagePayloadEthers({
        to: targetAddress,
        amount: netAmount,
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
    const startedTransferHash = sha256.array(startedPayloadSerialized);

    const sendTokenInstruction = await (new TokenMessage(programToken.methods)).sendInstruction(
        payer!,
        targetAddress,
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

    let sendTransferHash;
    let ClientEventParser = new EventParser(programInternalClient.programId, new BorshCoder(programInternalClient.idl));
    for (let event of ClientEventParser.parseLogs(InitTx!.meta!.logMessages!)) {
        sendTransferHash = event.data.transferHash;
    }

    await (new Refund(programToken.methods)).addRefundRequest(
        payer!,
        targetAddress,
        response.tokenName,
        sendTransferHash
    );

    // const status = true;

    // await (new Refund(programToken.methods)).processRefundRequest(
    //     payer!,
    //     response.tokenName,
    //     sendTransferHash,
    //     status,
    //     mintPda,
    //     clientAccountPda,
    //     payer!.publicKey,
    //     fromAccount,
    // );

};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
