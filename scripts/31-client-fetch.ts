
export {};

import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";


import prompts from "prompts";
import {getPayerFromConfig, } from "../tests/utils/testing";
import { getSettingsPda, } from "../sdk/ts/pda";
import {CLIENT_PROGRAM_ID} from "../sdk/ts/program";
import {AsterizmClient} from "../target/types/asterizm_client";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
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

};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
