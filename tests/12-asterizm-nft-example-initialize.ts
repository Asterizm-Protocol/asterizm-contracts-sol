import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmNftExample } from "../target/types/asterizm_nft_example";
import { getPayerFromConfig, nftClientOwner, nftTrustedUserAddress } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { InitializeNft } from "../sdk/ts/nft/initialize";
import { TrustedAddress } from "../sdk/ts/nft/trusted_address";
import { ClientSender } from "../sdk/ts/nft/client_sender";

describe("Asterizm nft example initialize tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmNftExample as Program<AsterizmNftExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  let relayOwner: null | PublicKey = null;

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(nftClientOwner.publicKey);
    relayOwner = payer!.publicKey;
  });

  it("Create Client", async () => {
    const init = new InitializeNft(program.methods);

    await init.createClient(nftClientOwner, relayOwner!, true, true, true);
  });

  it("Create nft example trusted address", async () => {
    const client = new TrustedAddress(program.methods);
    await client.create(nftClientOwner, nftTrustedUserAddress.publicKey, chainId);
  });

  it("Create nft example sender", async () => {
    const client = new ClientSender(program.methods);
    await client.create(nftClientOwner, nftClientOwner.publicKey);
  });
});
