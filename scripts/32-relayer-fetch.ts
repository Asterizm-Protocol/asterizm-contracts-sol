import BN from "bn.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";


import prompts from "prompts";
import {getPayerFromConfig, } from "../tests/utils/testing";
import {getChainPda, getSettingsPda,} from "../sdk/ts/pda";
import { RELAYER_PROGRAM_ID} from "../sdk/ts/program";
import {AsterizmRelayer} from "../target/types/asterizm_relayer";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "srcChainId",
            message: "SRC Chain id",
            initial: 0,
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
        .AsterizmRelayer as Program<AsterizmRelayer>;

    const clientSettingsAccount = getSettingsPda(RELAYER_PROGRAM_ID);
    const settings = await program.account.relayerSettings.fetch(
        clientSettingsAccount!
    );
    console.log(settings)

    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, new BN(response.srcChainId));
    const chain = await program.account.chain.fetch(
        chainAccount!
    );
    console.log(chain)

};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
