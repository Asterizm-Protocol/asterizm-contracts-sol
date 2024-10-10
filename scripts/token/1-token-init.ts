export {};

import * as anchor from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import {getPayerFromConfig} from "../../tests/utils/testing";
import prompts from "prompts";
import {AsterizmTokenExample} from "../../target/types/asterizm_token_example";
import {InitializeToken} from "../../sdk/ts/token/initialize";
import {getMintPda, getSettingsPda} from "../../sdk/ts/pda";
import {RELAYER_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID} from "../../sdk/ts/program";
import {getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
import {TrustedAddress} from "../../sdk/ts/token/trusted_address";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import {ClientSender} from "../../sdk/ts/token/client_sender";
import { BN } from "bn.js";

const main = async () => {
    const payer = await getPayerFromConfig();

    const response = await prompts([
        {
            type: "text",
            name: "tokenName",
            message: "Token name",
            initial: 'AsterizmToken',
        },
        {
            type: "number",
            name: "decimals",
            message: "Token decimals",
            initial: 9,
        },
        {
            type: "number",
            name: "fee",
            message: "User fee",
            initial: 0,
        },
        {
            type: "text",
            name: "tokenAddress",
            message: "Token address",
            initial: '0',
        },
        {
            type: "text",
            name: "trustAddress",
            message: "Trust address",
            initial: '0',
        },
        {
            type: "number",
            name: "mustCreateSender",
            message: "Must create sender (0 - no, 1 - yes)",
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

    const programToken = anchor.workspace.AsterizmTokenExample as Program<AsterizmTokenExample>;
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;


    const name = response.tokenName;
    const decimals = response.decimals;
    const fee = new BN(response.fee);

    if (response.tokenAddress == '0') {
        const clientInit = new InitializeToken(programToken.methods);
        await clientInit.createMint(
            payer!,
            name,
            decimals,
            payer!.publicKey,
            true,
            true,
            fee
        );

        return;
    }


    const mintPda = getMintPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        payer!.publicKey,
        name
    );
    await getOrCreateAssociatedTokenAccount(
        connection,
        payer!,
        mintPda,
        payer!.publicKey
    ).then((ac) => ac.address);



    if (response.trustAddress != '0') {
        const relaySettings = await programRelay.account.relayerSettings.fetch(
            getSettingsPda(RELAYER_PROGRAM_ID)
        );
        const clientTrust = new TrustedAddress(programToken.methods);
        // await clientTrust.remove(
        //     payer!,
        //     name,
        //     relaySettings.localChainId
        // );
        await clientTrust.create(
            payer!,
            name,
            new PublicKey(response.trustAddress),
            relaySettings.localChainId
        );
    }

    if (response.mustCreateSender > 0) {
        const clientSender = new ClientSender(programToken.methods);
        await clientSender.create(payer!, name, payer!.publicKey);
    }
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
