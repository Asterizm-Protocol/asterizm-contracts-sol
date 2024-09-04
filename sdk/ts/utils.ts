import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";

const provider = anchor.AnchorProvider.env();

export const fundWalletWithSOL = async (wallet: PublicKey) => {
  const airdropSignature = await provider.connection.requestAirdrop(
    wallet,
    LAMPORTS_PER_SOL * 12
  );
  await provider.connection.confirmTransaction(airdropSignature);
};

export const sendAndConfirmTx = async (
  ix: Transaction,
  signers: Array<Signer>
) => {
  const blockhashResponse =
    await provider.connection.getLatestBlockhashAndContext();
  const lastValidBlockHeight = blockhashResponse.context.slot + 150;
  const blockhash = blockhashResponse.value.blockhash;

  await provider.sendAndConfirm(
    new Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signatures: ix.signatures,
    }).add(ix),
    signers
  );
};

export const createNewMint = (decimals: number, payer: Signer) =>
  createMint(
    provider.connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    decimals
  );

export const mintToAta = (
  mintAuthority: Signer,
  mint: PublicKey,
  ata: PublicKey,
  amount: number
) =>
  mintTo(
    provider.connection,
    mintAuthority,
    mint,
    ata,
    mintAuthority,
    amount,
    []
  );

export const resolveAssociatedTokenAccount = async (
  mint: PublicKey,
  payer: Signer
) =>
  getOrCreateAssociatedTokenAccount(
    provider.connection,
    payer,
    mint,
    payer.publicKey
  ).then((ac) => ac.address);

export const getTokenAccountBalance = async (ata: PublicKey) =>
  provider.connection.getTokenAccountBalance(ata).then((ac) => ac.value.amount);
