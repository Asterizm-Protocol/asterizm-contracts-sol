import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmTokenExample } from "../target/types/asterizm_token_example";
import { getPayerFromConfig, tokenClientOwner, tokenSystemAccount, trustedUserAddress } from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { InitializeToken } from "../sdk/ts/token/initialize";
import {
  getMintPda,
} from "../sdk/ts/pda";
import { TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import assert from "assert";
import BN from "bn.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TrustedAddress } from "../sdk/ts/token/trusted_address";
import { ClientSender } from "../sdk/ts/token/client_sender";

describe("Asterizm token example initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
      .AsterizmTokenExample as Program<AsterizmTokenExample>;
  const name = "asterizm";
  const decimals = 9;
  const amount = new BN(0);
  let relayOwner: null | PublicKey = null;
  let payer: null | Keypair = null;
  const chainId = new BN(1);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(tokenClientOwner.publicKey);
    relayOwner = payer!.publicKey;
  });

  it("Create Mint", async () => {
    const init = new InitializeToken(program.methods);

    await init.createMint(
        tokenClientOwner,
        name,
        decimals,
        relayOwner!,
        true,
        true,
        true,
        new BN(0),
        new BN(0),
        new BN(500), // 5% owner fee rate (500 / 10000)
        new BN(200), // 2% system fee rate (200 / 10000)
        tokenSystemAccount.publicKey,
    );
  });

  it("Create Associated token account", async () => {
    const mintPda = getMintPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const to = await resolveAssociatedTokenAccount(mintPda, tokenClientOwner);
    const to_balance = await getTokenAccountBalance(to);

    assert.ok(to_balance == amount.toString());
  });

  it("Create token example trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(
        tokenClientOwner,
        name,
        trustedUserAddress.publicKey,
        chainId
    );
  });

  it("Create token example sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(tokenClientOwner, name, tokenClientOwner.publicKey);
  });

  it("Add token metadata", async () => {
    const init = new InitializeToken(program.methods);
    await init.addMeta(
        tokenClientOwner,
        name,
        "Asterizm Token",
        "AST",
        "https://asterizm.io/token-metadata.json"
    );
  });
});
