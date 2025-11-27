import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmTokenExample } from "../target/types/asterizm_token_example";
import { AsterizmClient } from "../target/types/asterizm_client";
import { getPayerFromConfig, tokenClientOwner, tokenSystemAccount, trustedUserAddress } from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { InitializeToken } from "../sdk/ts/token/initialize";
import {
  getMintPda,
  getClientAccountPda,
  getTokenClientAccountPda,
} from "../sdk/ts/pda";
import { TOKEN_EXAMPLE_PROGRAM_ID, CLIENT_PROGRAM_ID } from "../sdk/ts/program";
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
  const clientProgram = anchor.workspace
      .AsterizmClient as Program<AsterizmClient>;
  const name = "asterizm";
  const decimals = 9;
  const amount = new BN(0);
  let relayOwner: null | PublicKey = null;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const newRelayOwner = anchor.web3.Keypair.generate();

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(tokenClientOwner.publicKey);
    await fundWalletWithSOL(newRelayOwner.publicKey);
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

  it("Update client params", async () => {
    const init = new InitializeToken(program.methods);
    await init.updateClientParams(
        tokenClientOwner,
        name,
        newRelayOwner.publicKey,
        false,
        false,
        false
    );

    const tokenClientAccountPda = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );
    const clientAccountPda = getClientAccountPda(
        CLIENT_PROGRAM_ID,
        tokenClientAccountPda
    );
    const clientAccount = await clientProgram.account.clientAccount.fetch(
        clientAccountPda
    );

    assert.ok(clientAccount.relayOwner.equals(newRelayOwner.publicKey));
    assert.ok(clientAccount.notifyTransferSendingResult == false);
    assert.ok(clientAccount.disableHashValidation == false);
    assert.ok(clientAccount.refundEnabled == false);
  });

  it("Update client params to start", async () => {
    const init = new InitializeToken(program.methods);
    await init.updateClientParams(
        tokenClientOwner,
        name,
        relayOwner!,
        true,
        true,
        true
    );

    const tokenClientAccountPda = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );
    const clientAccountPda = getClientAccountPda(
        CLIENT_PROGRAM_ID,
        tokenClientAccountPda
    );
    const clientAccount = await clientProgram.account.clientAccount.fetch(
        clientAccountPda
    );

    assert.ok(clientAccount.relayOwner.equals(relayOwner!));
    assert.ok(clientAccount.notifyTransferSendingResult == true);
    assert.ok(clientAccount.disableHashValidation == true);
    assert.ok(clientAccount.refundEnabled == true);
  });
});
