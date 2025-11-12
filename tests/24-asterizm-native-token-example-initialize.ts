import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmNativeTokenExample } from "../target/types/asterizm_native_token_example";
import { getPayerFromConfig, nativeTokenClientOwner, nativeTokenMint, trustedUserAddress } from "./utils/testing";
import {
  createNewMint,
  fundWalletWithSOL,
  getTokenAccountBalance,
  mintToAta,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { InitializeToken } from "../sdk/ts/native_token/initialize";
import {
  getMintPda,
  getVaultAccountPda,
} from "../sdk/ts/pda";
import { NATIVE_TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import assert from "assert";
import BN from "bn.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TrustedAddress } from "../sdk/ts/native_token/trusted_address";
import { ClientSender } from "../sdk/ts/native_token/client_sender";

describe("Asterizm native token example initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
      .AsterizmNativeTokenExample as Program<AsterizmNativeTokenExample>;
  const name = "asterizm";
  const amount = new BN(0);
  let relayOwner: null | PublicKey = null;
  let payer: null | Keypair = null;
  const chainId = new BN(1);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(nativeTokenClientOwner.publicKey);
    relayOwner = payer!.publicKey;
    await createNewMint(9, nativeTokenClientOwner, nativeTokenMint);
  });

  it("Create Vault", async () => {
    const init = new InitializeToken(program.methods);

    await init.createVault(
        nativeTokenClientOwner,
        name,
        relayOwner!,
        nativeTokenMint.publicKey,
        true,
        true,
        true,
        new BN(0),
        new BN(0),
    );
  });

  it("Create Associated token account", async () => {
    const ata = await resolveAssociatedTokenAccount(nativeTokenMint.publicKey, nativeTokenClientOwner);
    const to_balance = await getTokenAccountBalance(ata);

    assert.ok(to_balance == amount.toString());
    await mintToAta(nativeTokenClientOwner, nativeTokenMint.publicKey, ata, 9999);

  });

  it("Fill Vault", async () => {
    const vault  = getVaultAccountPda(
        NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
        nativeTokenClientOwner.publicKey,
        name
    );

    await mintToAta(nativeTokenClientOwner, nativeTokenMint.publicKey, vault, 9999);
  });

  it("Create token example trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(
        nativeTokenClientOwner,
        name,
        trustedUserAddress.publicKey,
        chainId
    );
  });

  it("Create token example sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(nativeTokenClientOwner, name, nativeTokenClientOwner.publicKey);
  });
});
