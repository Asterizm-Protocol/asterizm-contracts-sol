import { PublicKey } from "@solana/web3.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {InitializeClient} from "../../sdk/ts/client/initialize";
import { BN } from "bn.js";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "localChainId",
            message: "Local chain ID",
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
        .AsterizmClient as Program<AsterizmClient>;

    const init = new InitializeClient(program.methods);
    await init.initialize(payer!, payer!.publicKey, new BN(response.localChainId));
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
