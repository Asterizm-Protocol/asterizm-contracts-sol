export {};

import * as anchor from "@coral-xyz/anchor";
import {serializeNftMessagePayloadEthers} from "../../sdk/ts/nft-message-payload-serializer-ethers";
import {ComputeBudgetProgram, Keypair, PublicKey, sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import {
    getClientAccountPda,
    getTrustedAccountPda,
    getSettingsPda,
} from "../../sdk/ts/pda";
import BN from "bn.js";
import {CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID} from "../../sdk/ts/program";
import {getPayer2FromConfig, getPayerFromConfig, nftClientOwner, nftMint} from "../../tests/utils/testing";
import prompts from "prompts";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {serializePayloadEthers} from "../../sdk/ts/payload-serializer-ethers";
import {sha256} from "js-sha256";
import {RelayMessage} from "../../sdk/ts/relayer/message";
import { Nft } from "../../sdk/ts/nft/nft";
import {AsterizmNftExample} from "../../target/types/asterizm_nft_example";

const main = async () => {
    const payer1 = await getPayerFromConfig();
    const payer2 = await getPayer2FromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "nftId",
            message: "NFT ID",
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
            name: "dstAddress",
            message: "dstAddress (address on other blockchain side, needed to be in trusted addresses)",
            // initial: "FmV6UunQF1zdxQb9yHAQHKkN2Eo1rjJbdjRFdrq2Xtyn", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
            initial: "2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ", // 2dVERZcTfRnja8BXNJEk666nmai5mWJthW1YzMy2QoqZ - for second payer
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

    const programNft = anchor.workspace.AsterizmNftExample as Program<AsterizmNftExample>;


    const dstAddress = new PublicKey(response.dstAddress);
    const nftId = response.nftId;
    // const uri = "https://joxi.ru/52aQZb7CZvlW52";
    const uri = "https://bafybeifzylpxnqbdh4tdcdssuink2qsrznsdz4suvp6cmi54fwtjtcu6ze.ipfs.w3s.link/lvl1.png";
    const tokenName = response.tokenName + ' #' + nftId;
    const nftMint = anchor.web3.Keypair.generate();




    const instructionMint = await (new Nft(programNft.methods)).mint(
        payer!,
        uri,
        tokenName,
        response.tokenSymbol,
        dstAddress,
        payer!.publicKey,
        nftMint
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instructionMint);
    tx.feePayer = payer!.publicKey;
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    const keys = [payer!, nftMint];
    tx.partialSign(...keys);

    await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
        commitment: "confirmed",
        skipPreflight: true,
    });

};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
