import { PublicKey } from "@solana/web3.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmClient } from "../../target/types/asterizm_client";
import {TrustedAddress} from "../../sdk/ts/client/trusted_address";
import { BN } from "bn.js";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "number",
            name: "chainId",
            message: "Trusted chain ID",
            initial: 0,
        },
        {
            type: "text",
            name: "address",
            message: "Trusted address",
            initial: 0,
        },
        {
            type: "number",
            name: "needToRemove",
            message: "Need to remove old trusted address in chain (0 - not removing, 1 - removing)",
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

    const client = new TrustedAddress(program.methods);
    if (response.chainId) {
        await client.remove(
            payer!,
            payer!.publicKey,
            new BN(response.chainId)
        );
    }

    await client.create(
        payer!,
        payer!.publicKey,
        new PublicKey(response.address),
        new BN(response.chainId)
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
