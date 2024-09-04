import {sha256} from "js-sha256";

export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {AnchorProvider, Program, EventParser, BorshCoder} from "@coral-xyz/anchor";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {
    getClientAccountPda,
    getTrustedAccountPda,
    getSettingsPda,
} from "../../sdk/ts/pda";
import BN from "bn.js";
import {
    CLIENT_PROGRAM_ID,
    RELAYER_PROGRAM_ID,
} from "../../sdk/ts/program";
import {ComputeBudgetProgram, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import {getPayer2FromConfig, getPayerFromConfig, nftClientOwner, nftMint} from "../../tests/utils/testing";
import prompts from "prompts";
import {ClientMessage} from "../../sdk/ts/client/message";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {RelayMessage} from "../../sdk/ts/relayer/message";
import {Nft} from "../../sdk/ts/nft/nft";
import {AsterizmNftExample} from "../../target/types/asterizm_nft_example";
import {serializePayloadEthers} from "../../sdk/ts/payload-serializer-ethers";
import {serializeNftMessagePayloadEthers} from "../../sdk/ts/nft-message-payload-serializer-ethers";

const main = async () => {
    const payer1 = await getPayerFromConfig();
    const payer2 = await getPayer2FromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "dstChainId",
            message: "DST chain id",
            initial: 50001,
        },
        {
            type: "number",
            name: "txId",
            message: "Tx id",
            initial: 0,
        },
        {
            type: "number",
            name: "nftId",
            message: "NFT id",
            initial: 0,
        },
        {
            type: "text",
            name: "mintAddress",
            message: "NFT mint address",
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
            name: "tokenSymbol",
            message: "Token symbol",
            initial: 'AST',
        },
        {
            type: "text",
            name: "targetAddress",
            message: "targetAddress (address for sending tokens in destination chain)",
            // initial: "7whpo6vfw7adGJ67SfZYQeNqTbHRko9M4phJbzWZiqAs", // E1UDRhAy5mmwwdLWLHnFzfoEhySyZhRUYm2rfpwapVt8 - for second payer
            initial: "E1UDRhAy5mmwwdLWLHnFzfoEhySyZhRUYm2rfpwapVt8", // E1UDRhAy5mmwwdLWLHnFzfoEhySyZhRUYm2rfpwapVt8 - for second payer
        },
        {
            type: "text",
            name: "srcAddress",
            message: "srcAddress (client address)",
            // initial: "FmV6UunQF1zdxQb9yHAQHKkN2Eo1rjJbdjRFdrq2Xtyn", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
            initial: "2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
        },
        {
            type: "text",
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            // initial: "FmV6UunQF1zdxQb9yHAQHKkN2Eo1rjJbdjRFdrq2Xtyn", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
            initial: "2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
        },
        {
            type: "number",
            name: "feeValue",
            message: "Fee value",
            initial: 100,
        },
        {
            type: "number",
            name: "payerNumber",
            message: "Payer key number",
            initial: 2,
        },
        {
            type: "text",
            name: "endpoint",
            message: "Solana Endpoint",
            initial: "https://api.devnet.solana.com/",
        },
    ]);

    let payer;
    response.payerNumber == 1 ? payer = payer1 : payer = payer2;

    const connection = new anchor.web3.Connection(response.endpoint);
    const wallet = new anchor.Wallet(payer);
    const provider = new AnchorProvider(connection, wallet);
    anchor.setProvider(provider);

    const programInternalClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programClient = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
    const programNft = anchor.workspace.AsterizmNftExample as Program<AsterizmNftExample>;


    const srcAddress = new PublicKey(response.srcAddress);
    const dstChainId = new BN(response.dstChainId);
    const dstAddress = new PublicKey(response.dstAddress);
    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    let txId = response.txId;
    if (response.txId == 0) {
        const clientAccount = await programInternalClient.account.clientAccount.fetch(
            getClientAccountPda(CLIENT_PROGRAM_ID, srcAddress)
        );
        txId = clientAccount.txId;
    }
    const nftId = new BN(response.nftId).toBuffer("le", 32);
    // const uri = "https://gas.chainspot.io/logo/chainspot-logo.png";
    const uri = "https://bafybeifzylpxnqbdh4tdcdssuink2qsrznsdz4suvp6cmi54fwtjtcu6ze.ipfs.w3s.link/lvl1.png";
    const tokenName = response.tokenName + ' #' + new BN(response.nftId).toString();

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

    let mintAddress: PublicKey = new PublicKey(response.mintAddress);
    // TODO: we can find mintNft address from user account, but we can use nftAddress instead
    // let mintResponse = await provider.connection.getParsedTokenAccountsByOwner(payer!.publicKey, {
    //     programId: TOKEN_PROGRAM_ID,
    // }).then((data) => data.value.map((value) => value.pubkey));
    //
    // for (const address of mintResponse) {
    //     const tokenAccount = await getAccount(provider.connection, address)
    //
    //     if (tokenAccount.mint.toBase58() == new PublicKey(response.mintAddress).toBase58()) {
    //         mint = tokenAccount.mint;
    //         break
    //     }
    // }




    const payload = serializeNftMessagePayloadEthers({
        to: payer!.publicKey,
        id: nftId,
        uri,
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
    const initInstruction = await (new Nft(programNft.methods)).burn(
        payer!,
        srcAddress,
        nftId,
        dstChainId,
        payer!.publicKey,
        startedTransferHash,
        uri,
        clientAccountPda,
        srcTrustedAddressPda,
        mintAddress!
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(initInstruction);
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






    const clientInstruction = await (new ClientMessage(programClient.methods)).sendInstruction(
        payer!,
        srcAddress,
        dstAddress,
        payer1!.publicKey,
        payer1!.publicKey,
        srcChainId!,
        dstChainId,
        txId,
        sendTransferHash,
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
        payer1!,
        payer1!.publicKey,
        srcChainId,
        srcAddress,
        dstChainId,
        dstAddress,
        txId,
        sendTransferHash,
        clientAccountPda,
        dstTrustedAddressPda
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(relayInstructions);
    tx.feePayer = payer1.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer1);

    const relayTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const relayTx = await anchor.getProvider().connection.getTransaction(relayTxHash, {
        commitment: "confirmed",
    });

    let eventSrcChainId, eventSrcAddress, eventTxId, eventTransferHash;
    let DstRelayEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    for (let event of DstRelayEventParser.parseLogs(relayTx!.meta!.logMessages!)) {
        eventSrcChainId = event.data.srcChainId;
        eventSrcAddress = event.data.srcAddress;
        eventTxId = event.data.txId;
        eventTransferHash = event.data.transferHash;
    }




    const instructionVftReceive = await (new Nft(programNft.methods)).receive(
        payer!,
        tokenName,
        response.tokenSymbol,
        uri,
        eventTransferHash,
        srcChainId,
        srcAddress,
        txId,
        Buffer.from(sendPayload),
        clientAccountPda,
        dstAddress,
        dstTrustedAddressPda
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instructionVftReceive);
    tx.feePayer = payer!.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(payer!);

    const nftReceiveTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const nftReceiveTx = await anchor.getProvider().connection.getTransaction(nftReceiveTxHash, {
        commitment: "confirmed",
    });

    let DstClientReceiveEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    for (let event of DstClientReceiveEventParser.parseLogs(nftReceiveTx!.meta!.logMessages!)) {
        console.log(event);
    }






    const nftMint = anchor.web3.Keypair.generate();

    const instructionNftCreate = await (new Nft(programNft.methods)).create(
        payer!,
        eventTransferHash,
        dstAddress,
        payer!.publicKey,
        nftMint
    );

    tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instructionNftCreate);
    tx.feePayer = payer!.publicKey;
    latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    const keys = [payer!, nftMint];
    tx.partialSign(...keys);

    const clientReceiveTxHash = await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
    });
    const clientReceiveTx = await anchor.getProvider().connection.getTransaction(clientReceiveTxHash, {
        commitment: "confirmed",
    });

    let DstClientEventParser = new EventParser(programClient.programId, new BorshCoder(programClient.idl));
    for (let event of DstClientEventParser.parseLogs(clientReceiveTx!.meta!.logMessages!)) {
        console.log(event);
    }
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
