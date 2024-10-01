import { PublicKey } from "@solana/web3.js";

export {};

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmTokenExample } from "../../target/types/asterizm_token_example";
import {TrustedAddress} from "../../sdk/ts/token/trusted_address";
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
            name: "trustedAddress",
            message: "Trusted address",
            initial: 0,
        },
        {
            type: "text",
            name: "tokenName",
            message: "Token name",
            initial: 'AsterizmToken1',
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
        .AsterizmTokenExample as Program<AsterizmTokenExample>;

    const client = new TrustedAddress(program.methods);
    if (response.needToRemove == 1) {
        await client.remove(
            payer!,
            response.tokenName,
            new BN(response.chainId)
        );
    }

    await client.create(
        payer!,
        response.tokenName,
        new PublicKey(response.trustedAddress),
        new BN(response.chainId)
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
