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
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, NFT_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { Nft } from "../sdk/ts/nft/nft";
import { serializeNftMessagePayloadEthers } from "../sdk/ts/nft-message-payload-serializer-ethers";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import assert from "assert";
import {getAccount, TOKEN_PROGRAM_ID} from "@solana/spl-token"

describe("Asterizm nft example receive message update tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmNftExample as Program<AsterizmNftExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const localChainId = new BN(1000);
  const name = "asterizm_nft";
  const symbol = "AAA";
  const uri = "https://google1.com";
  const txId = new BN(6);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
  });

  it("Receive Message And Update", async () => {
    const nft = new Nft(program.methods);
    const dstAddress = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      nftClientOwner.publicKey
    );
    const id = payer!.publicKey.toBuffer();
    const to = payer!.publicKey;

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
    
    let response = await provider.connection.getParsedTokenAccountsByOwner(payer!.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    }).then((data) => data.value.map((value) => value.pubkey));

    let mint: PublicKey;
    for (const address of response) {
      const tokenAccount = await getAccount(provider.connection, address)

      if (tokenAccount.mint.toBase58() == nftMint.publicKey.toBase58()) {
        mint = tokenAccount.mint;
        break
      }
    }

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
    tx1.add(receiveInstruction);
    tx1.feePayer = nftClientOwner.publicKey;
    const latestBlockhash1 = await provider.connection.getLatestBlockhash();
    tx1.recentBlockhash = latestBlockhash1.blockhash;
    tx1.sign(nftClientOwner);

    await sendAndConfirmRawTransaction(provider.connection, tx1.serialize(), {
      commitment: "confirmed",
      skipPreflight: true,
    });
    
    const instruction = await nft.update(
      nftClientOwner,
      transferHash,
      dstAddress,
      to,
      mint!
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instruction);
    tx.feePayer = nftClientOwner.publicKey;
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(nftClientOwner);

    await sendAndConfirmRawTransaction(provider.connection, tx.serialize(), {
      commitment: "confirmed",
    });

    const umi = createUmi(provider.connection).use(mplTokenMetadata());

    let asset = await fetchDigitalAsset(
      umi,
      publicKey(nftMint.publicKey)
    );

    assert.ok(uri == asset.metadata.uri);
  });
});
