import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import { getPayerFromConfig, valueClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import { ClientAccount } from "../sdk/ts/client/client_account";
import { TrustedAddress } from "../sdk/ts/client/trusted_address";
import BN from "bn.js";
import { ClientSender } from "../sdk/ts/client/client_sender";

describe("Asterizm client create client Value tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  let payer: null | Keypair = null;
  let relayOwner: null | PublicKey = null;
  const trustedUserAddress = anchor.web3.Keypair.generate();
  const chainId = new BN(1);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    await fundWalletWithSOL(valueClientOwner.publicKey);
    relayOwner = payer!.publicKey;
  });

  it("Create Value Client account", async () => {
    const client = new ClientAccount(program.methods);
    await client.create(
      payer!,
      valueClientOwner.publicKey,
      relayOwner!,
      true,
      true
    );
  });

  it("Create Value client account trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(
      valueClientOwner,
      valueClientOwner.publicKey,
      trustedUserAddress.publicKey,
      chainId
    );
  });
  it("Create Value client sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(
      valueClientOwner,
      valueClientOwner.publicKey,
      valueClientOwner.publicKey
    );
  });
});
