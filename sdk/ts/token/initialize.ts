import { Keypair, PublicKey, TransactionInstruction, PublicKey as SolanaPublicKey } from "@solana/web3.js";
import {
    CLIENT_PROGRAM_ID,
    ITokenExampleProgramAPI,
    TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
    getClientAccountPda,
    getMintEnableAccountPda,
    getMintPdaWithBump,
    getSettingsPda,
    getTokenClientAccountPda,
} from "../pda";
import BN from "bn.js";

export class InitializeToken {
    constructor(private readonly programAPI: ITokenExampleProgramAPI) {}

    async createMint(
        authority: Keypair,
        name: string,
        decimals: number,
        relayOwner: PublicKey,
        notifyTransferSendingResult: boolean,
        disableHashValidation: boolean,
        refundEnabled: boolean,
        fee: BN,
        refundFee: BN,
        ownerFeeRate: BN,
        systemFeeRate: BN,
        systemFeeAddress: PublicKey
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            authority.publicKey,
            name
        );

        const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
        const clientAccount = getClientAccountPda(
            CLIENT_PROGRAM_ID,
            tokenClientAccount
        );

        await this.programAPI
            .createMint(
                name,
                decimals,
                relayOwner,
                notifyTransferSendingResult,
                disableHashValidation,
                refundEnabled,
                fee,
                refundFee,
                ownerFeeRate,
                systemFeeRate,
                systemFeeAddress
            )
            .accountsPartial({
                authority: authority.publicKey,
                tokenClientAccount,
                clientProgramSettings,
                clientAccount,
            })
            .signers([authority])
            .rpc();
    }

    async createMintInstruction(
        authority: Keypair,
        name: string,
        decimals: number,
        relayOwner: PublicKey,
        notifyTransferSendingResult: boolean,
        disableHashValidation: boolean,
        refundEnabled: boolean,
        fee: BN,
        refundFee: BN,
        ownerFeeRate: BN,
        systemFeeRate: BN,
        systemFeeAddress: PublicKey
    ): Promise<TransactionInstruction> {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            authority.publicKey,
            name
        );

        const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
        const clientAccount = getClientAccountPda(
            CLIENT_PROGRAM_ID,
            tokenClientAccount
        );

        return this.programAPI
            .createMint(
                name,
                decimals,
                relayOwner,
                notifyTransferSendingResult,
                disableHashValidation,
                refundEnabled,
                fee,
                refundFee,
                ownerFeeRate,
                systemFeeRate,
                systemFeeAddress
            )
            .accountsPartial({
                authority: authority.publicKey,
                tokenClientAccount,
                clientProgramSettings,
                clientAccount,
            })
            .signers([authority])
            .instruction();
    }

    async mintToUser(
        authority: Keypair,
        name: string,
        toAta: PublicKey,
        amount: BN
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            authority.publicKey,
            name
        );

        const mintEnableAccount = getMintEnableAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            tokenClientAccount
        );

        const [mintPda, _mintBump] = getMintPdaWithBump(TOKEN_EXAMPLE_PROGRAM_ID, authority.publicKey, name);

        await this.programAPI
            .mintToUser(name, amount)
            .accountsPartial({
                authority: authority.publicKey,
                tokenAccount: toAta,
                tokenClientAccount,
                mint: mintPda,
                mintEnableAccount,
            })
            .signers([authority])
            .rpc();
    }

    async updateFee(authority: Keypair, name: string, fee: BN, refundFee: BN) {
        await this.programAPI
            .updateFee(name, fee, refundFee)
            .accountsPartial({
                authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
    }

    async updateClientParams(
        authority: Keypair,
        name: string,
        relayOwner: PublicKey,
        notifyTransferSendingResult: boolean,
        disableHashValidation: boolean,
        refundEnabled: boolean
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            authority.publicKey,
            name
        );

        const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
        const clientAccount = getClientAccountPda(
            CLIENT_PROGRAM_ID,
            tokenClientAccount
        );

        await this.programAPI
            .updateClientParams(
                name,
                relayOwner,
                notifyTransferSendingResult,
                disableHashValidation,
                refundEnabled
            )
            .accountsPartial({
                authority: authority.publicKey,
                tokenClientAccount,
                clientProgramSettings,
                clientAccount,
            })
            .signers([authority])
            .rpc();
    }

    async addMeta(
        authority: Keypair,
        name: string,
        tokenName: string,
        symbol: string,
        uri: string
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            authority.publicKey,
            name
        );

        const [mintPda, mintBump] = getMintPdaWithBump(TOKEN_EXAMPLE_PROGRAM_ID, authority.publicKey, name);

        const [metadataPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
                mintPda.toBuffer(),
            ],
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
        );

        await this.programAPI
            .addMeta(name, mintBump, tokenName, symbol, uri)
            .accountsPartial({
                authority: authority.publicKey,
                tokenClientAccount,
                mint: mintPda,
                metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                tokenMetadata: metadataPda,
            })
            .signers([authority])
            .rpc();
    }

    async enableMintForClient(
        upgradeAuthority: Keypair,
        tokenClientOwner: PublicKey,
        name: string
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            tokenClientOwner,
            name
        );

        const mintEnableAccount = getMintEnableAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            tokenClientAccount
        );

        const [programData] = PublicKey.findProgramAddressSync(
            [TOKEN_EXAMPLE_PROGRAM_ID.toBytes()],
            new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
        );

        await this.programAPI
            .enableMintForClient(tokenClientOwner, name)
            .accountsPartial({
                authority: upgradeAuthority.publicKey,
                tokenClientAccount,
                mintEnableAccount,
                program: TOKEN_EXAMPLE_PROGRAM_ID,
                programData,
            })
            .signers([upgradeAuthority])
            .rpc();
    }

    async disableMintForClient(
        upgradeAuthority: Keypair,
        tokenClientOwner: PublicKey,
        name: string
    ) {
        const tokenClientAccount = getTokenClientAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            tokenClientOwner,
            name
        );

        const mintEnableAccount = getMintEnableAccountPda(
            TOKEN_EXAMPLE_PROGRAM_ID,
            tokenClientAccount
        );

        const [programData] = PublicKey.findProgramAddressSync(
            [TOKEN_EXAMPLE_PROGRAM_ID.toBytes()],
            new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
        );

        await this.programAPI
            .disableMintForClient(tokenClientOwner, name)
            .accountsPartial({
                authority: upgradeAuthority.publicKey,
                tokenClientAccount,
                mintEnableAccount,
                program: TOKEN_EXAMPLE_PROGRAM_ID,
                programData,
            })
            .signers([upgradeAuthority])
            .rpc();
    }
}
