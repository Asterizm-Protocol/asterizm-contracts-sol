export {};

import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";


import prompts from "prompts";
import {getPayerFromConfig, } from "../tests/utils/testing";
import { getSettingsPda, getTrustedAccountPda, } from "../sdk/ts/pda";
import {CLIENT_PROGRAM_ID} from "../sdk/ts/program";
import {AsterizmClient} from "../target/types/asterizm_client";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "chainId",
            message: "chain id",
            initial: 11155111,
        },
        {
            type: "text",
            name: "user",
            message: "(user address)",
            initial: "FsNa7kiksBmmJtyGjo8MyoQx3rHaSAsq8dFviD8L4Xgr",
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
    const program = anchor.workspace
        .AsterizmClient as Program<AsterizmClient>;

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);
    const settings = await program.account.clientProgramSettings.fetch(
        clientSettingsAccount!
    );
    console.log(settings)

    const trustedAddress = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        new PublicKey(response.user),
        new BN(response.chainId)
    );

    console.log(trustedAddress)
    const trust = await program.account.clientTrustedAddress.fetch(
        trustedAddress!
    );
    console.log(trust)

};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
