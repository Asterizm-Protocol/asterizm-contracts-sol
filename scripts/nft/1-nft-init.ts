export {};

import * as anchor from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";
import {getSettingsPda} from "../../sdk/ts/pda";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import {getPayerFromConfig, getPayer2FromConfig} from "../../tests/utils/testing";
import prompts from "prompts";
import {AsterizmNftExample} from "../../target/types/asterizm_nft_example";
import {InitializeNft} from "../../sdk/ts/nft/initialize";
import {RELAYER_PROGRAM_ID} from "../../sdk/ts/program";
import {AsterizmRelayer} from "../../target/types/asterizm_relayer";
import { ClientSender } from "../../sdk/ts/nft/client_sender";
import { TrustedAddress } from "../../sdk/ts/nft/trusted_address";
import {BN} from "bn.js";

const main = async () => {
    const payer1 = await getPayerFromConfig();
    const payer2 = await getPayer2FromConfig();

    const response = await prompts([
        {
            type: "text",
            name: "trustAddress",
            message: "Trust address",
            initial: 'FmV6UunQF1zdxQb9yHAQHKkN2Eo1rjJbdjRFdrq2Xtyn',
        },
        {
            type: "number",
            name: "mustCreateClient",
            message: "Must create client (0 - no, 1 - yes)",
            initial: 0,
        },
        {
            type: "number",
            name: "mustCreateSender",
            message: "Must create sender (0 - no, 1 - yes)",
            initial: 0,
        },
        {
            type: "number",
            name: "payerNumber",
            message: "Payer key number",
            initial: 1,
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
    const programRelay = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;



    if (response.mustCreateClient > 0) {
        const init = new InitializeNft(programNft.methods);

        await init.createClient(payer!, payer1!.publicKey, true, false);
        // await init.updateClient(payer!, payer1!.publicKey, true, false);
    }

    if (response.trustAddress != '0') {
        const relaySettings = await programRelay.account.relayerSettings.fetch(
            getSettingsPda(RELAYER_PROGRAM_ID)
        );
        const client = new TrustedAddress(programNft.methods);
        await client.create(payer!, new PublicKey (response.trustAddress), new BN (relaySettings.localChainId));
    }

    if (response.mustCreateSender > 0) {
        const client = new ClientSender(programNft.methods);
        await client.create(payer!, payer!.publicKey);
    }
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
