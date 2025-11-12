import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmNftExample } from "../target/types/asterizm_nft_example";
import {
  getClientAccountPda,
  getNftClientAccountPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, nftClientOwner, nftMint, nftTrustedUserAddress } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import {
  ComputeBudgetProgram,
  Keypair,
  sendAndConfirmRawTransaction,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, NFT_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { Nft } from "../sdk/ts/nft/nft";
import { serializeNftMessagePayloadEthers } from "../sdk/ts/nft-message-payload-serializer-ethers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import assert from "assert";

describe("Asterizm nft example receive message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
      .AsterizmNftExample as Program<AsterizmNftExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const localChainId = new BN(1000);
  const name = "asterizm_nft";
  const symbol = "AAA";
  const uri = "https://google.com";
  const txId = new BN(5);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(nftClientOwner.publicKey);
  });

  it("Receive Message", async () => {
    const nft = new Nft(program.methods);
    const dstAddress = getNftClientAccountPda(
        NFT_EXAMPLE_PROGRAM_ID,
        nftClientOwner.publicKey
    );
    const to = payer!.publicKey;
    const id = payer!.publicKey.toBuffer();

    const srcAddress = nftTrustedUserAddress.publicKey;

    const payload = serializeNftMessagePayloadEthers({
      to,
      id,
      uri,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: localChainId!,
      payload,
      srcAddress,
      srcChainId: chainId!,
      txId: txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        dstAddress,
        chainId
    );

    const receiveInstruction = await nft.receive(
        nftClientOwner,
        name,
        symbol,
        uri,
        transferHash,
        chainId,
        srcAddress,
        txId,
        Buffer.from(payload),
        clientAccountPda,
        dstAddress,
        trustedAddressPda,
    );

    let tx1 = new Transaction();
    tx1.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx1.add(receiveInstruction);
    tx1.feePayer = nftClientOwner.publicKey;
    const latestBlockhash1 = await provider.connection.getLatestBlockhash();
    tx1.recentBlockhash = latestBlockhash1.blockhash;
    tx1.sign(nftClientOwner);

    await sendAndConfirmRawTransaction(provider.connection, tx1.serialize(), {
      commitment: "confirmed",
      skipPreflight: true,
    });

    const instruction = await nft.create(
        nftClientOwner,
        transferHash,
        dstAddress,
        to,
        nftMint
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
    tx.add(instruction);
    tx.feePayer = nftClientOwner.publicKey;
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    const keys = [nftClientOwner, nftMint];
    tx.partialSign(...keys);

    await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
      commitment: "confirmed",
      skipPreflight: true,
    });

    const umi = createUmi(provider.connection).use(mplTokenMetadata());

    let asset = await fetchDigitalAsset(
        umi,
        publicKey(nftMint.publicKey)
    );

    assert.ok(uri == asset.metadata.uri);
  });
});
