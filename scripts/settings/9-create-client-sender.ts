import { PublicKey } from "@solana/web3.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {ClientSender} from "../../sdk/ts/client/client_sender";

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

    const client = new ClientSender(program.methods);
    await client.create(
        payer!,
        payer!.publicKey,
        payer!.publicKey
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
