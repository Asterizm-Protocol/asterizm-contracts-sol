export {};

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getPayerFromConfig } from "../../tests/utils/testing";
import prompts from "prompts";
import { AsterizmTokenExample } from "../../target/types/asterizm_token_example";
import { InitializeToken } from "../../sdk/ts/token/initialize";

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
            type: "text",
            name: "relayOwnerAddress",
            message: "Relay owner address (for mainnet - FzFFcBizVrx55qmnd1WwLDQwyuWkTwHBodCpBtsiF6PX , for testnet - 0, using one owner for all)",
            initial: '0',
        },
        {
            type: "number",
            name: "notifyTransferSendingResult",
            message: "Notify transfer sending result (0 - no, 1 - yes)",
            initial: 1,
        },
        {
            type: "number",
            name: "disableHashValidation",
            message: "Disable hash validation (0 - no, 1 - yes)",
            initial: 0,
        },
        {
            type: "number",
            name: "refundEnabled",
            message: "Refund enabled (0 - no, 1 - yes)",
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

    const name = response.tokenName;
    const relayOwner = response.relayOwnerAddress == '0' ? payer!.publicKey : new PublicKey(response.relayOwnerAddress);
    const notifyTransferSendingResult = response.notifyTransferSendingResult > 0;
    const disableHashValidation = response.disableHashValidation > 0;
    const refundEnabled = response.refundEnabled > 0;

    const clientInit = new InitializeToken(programToken.methods);
    await clientInit.updateClientParams(
        payer!,
        name,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation,
        refundEnabled
    );
};
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
