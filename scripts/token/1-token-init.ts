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
            type: "text",
            name: "metaName",
            message: "Token metadata name",
            initial: 'Asterizm Token',
        },
        {
            type: "text",
            name: "metaSymbol",
            message: "Token metadata symbol",
            initial: 'AST',
        },
        {
            type: "text",
            name: "metaUri",
            message: "Token metadata URI (example: https://example.com/metadata.json)",
            initial: '',
        },
        {
            type: "number",
            name: "ownerFeeRate",
            message: "Owner fee rate (10000 == 100%)",
            initial: 10,
        },
        {
            type: "number",
            name: "systemFeeRate",
            message: "System fee rate (10000 == 100%)",
            initial: 10,
        },
        {
            type: "text",
            name: "systemFeeAddress",
            message: "System fee address",
            initial: '3MPcEphc8VTuotbFKbnotg1bYoUTtdinCYFkNPEEUUR6',
        },
        {
            type: "text",
            name: "relayOwnerAddress",
            message: "Relay owner address (for mainnet - FzFFcBizVrx55qmnd1WwLDQwyuWkTwHBodCpBtsiF6PX, for testnet - 0, using one owner for all)",
            initial: '0',
        },
        {
            type: "number",
            name: "fee",
            message: "User fee (user fee in native coins)",
            initial: 0,
        },
        {
            type: "text",
            name: "tokenAddress",
            message: "Token address (0 - initialize new token)",
            initial: '0',
        },
        {
            type: "text",
            name: "trustAddress",
            message: "Trust address (not 0 - add trusted address)",
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
    const refundFee = new BN(response.fee);
    const ownerFeeRate = new BN(response.ownerFeeRate);
    const systemFeeRate = new BN(response.systemFeeRate);
    const systemFeeAddress = new PublicKey(response.systemFeeAddress);

    if (response.tokenAddress == '0') {
        const clientInit = new InitializeToken(programToken.methods);
        await clientInit.createMint(
            payer!,
            name,
            decimals,
            response.relayOwnerAddress == '0' ? payer!.publicKey : response.relayOwnerAddress,
            true,
            true,
            true,
            fee,
            refundFee,
            ownerFeeRate,
            systemFeeRate,
            systemFeeAddress
        );

        await clientInit.addMeta(
            payer!,
            name,
            response.metaName,
            response.metaSymbol,
            response.metaUri
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
        payer!.publicKey,
        false,
        'confirmed',
    ).then((ac) => ac.address);

    if (response.tokenAddress != '0') {
        await getOrCreateAssociatedTokenAccount(
            connection,
            payer!,
            new PublicKey(response.tokenAddress),
            systemFeeAddress,
            false,
            'confirmed',
        ).then((ac) => ac.address);
    }

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

    if (response.mustCreateSender != '0') {
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
