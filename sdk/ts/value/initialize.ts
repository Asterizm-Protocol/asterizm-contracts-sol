import { Keypair } from "@solana/web3.js";
import { IValueExampleProgramAPI } from "../program";

export class InitializeValue {
    constructor(private readonly programAPI: IValueExampleProgramAPI) {}

    async createClient(
        authority: Keypair,
    ) {
        await this.programAPI
            .createValueClient()
            .accounts({
                authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
    }
}
