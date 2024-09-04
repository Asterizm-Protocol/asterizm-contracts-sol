import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmNftExample } from "../target/types/asterizm_nft_example";
import {
  getClientAccountPda,
  getNftClientAccountPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import {
  getPayerFromConfig,
  nftClientOwner,
  nftMint,
  nftTrustedUserAddress,
  shouldFail,
} from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import {Keypair, PublicKey} from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, NFT_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { Nft } from "../sdk/ts/nft/nft";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { serializeNftMessagePayloadEthers } from "../sdk/ts/nft-message-payload-serializer-ethers";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";

describe("Asterizm nft example init send message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmNftExample as Program<AsterizmNftExample>;
  let payer: null | Keypair = null;
  const dstChainId = new BN(1);
  const uri = "https://google1.com";
  const localChainId = new BN(1000);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
  });

  it("Send init Message", async () => {
    const nft = new Nft(program.methods);
    const srcAddress = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      nftClientOwner.publicKey
    );
    const id = payer!.publicKey.toBuffer();

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, srcAddress);

    const clientAccount = await program.account.clientAccount.fetch(
      clientAccountPda
    );

    const txId = clientAccount.txId;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      dstChainId
    );

    const dstAddress = nftTrustedUserAddress.publicKey;

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

    const payload = serializeNftMessagePayloadEthers({
      to: dstAddress,
      id,
      uri,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: dstChainId!,
      payload,
      srcAddress,
      srcChainId: localChainId!,
      txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const instruction = await nft.burn(
      payer!,
      srcAddress,
      id,
      dstChainId,
      dstAddress,
      transferHash,
      uri,
      clientAccountPda,
      trustedAddressPda,
      mint!
    );

    let tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
    tx.add(instruction);
    await provider.sendAndConfirm(tx);

    const umi = createUmi(provider.connection).use(mplTokenMetadata());

    await shouldFail(
      () =>
        fetchDigitalAsset(
          umi,
          publicKey(nftMint.publicKey)
        ),
      "cannot deserialize empty buffers"
    );
  });
});
