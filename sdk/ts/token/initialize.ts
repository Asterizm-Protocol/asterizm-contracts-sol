import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  ITokenExampleProgramAPI,
  TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
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

    console.log({
        'Authority address': authority.publicKey.toString(),
        'Token example ID': TOKEN_EXAMPLE_PROGRAM_ID.toString(),
        'Client program  ID': CLIENT_PROGRAM_ID.toString(),
        'Token name': name,
        'Token client account': tokenClientAccount.toString(),
        'Client program settings': clientProgramSettings.toString(),
        'Client Account': clientAccount.toString(),
    });

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

    await this.programAPI
        .mintToUser(name, amount)
        .accountsPartial({
          authority: authority.publicKey,
          tokenAccount: toAta,
          tokenClientAccount,
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
}
