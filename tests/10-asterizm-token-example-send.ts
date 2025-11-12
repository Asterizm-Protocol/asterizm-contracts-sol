import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmTokenExample } from "../target/types/asterizm_token_example";
import {
  getMintPda,
  getTokenClientAccountPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, tokenClientOwner } from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { TokenMessage } from "../sdk/ts/token/message";
import assert from "assert";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import {
  calculateFees,
  assertFeeCreditedToAccount,
  FEE_RATES,
} from "./utils/fees";

describe("Asterizm token example init send message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
      .AsterizmTokenExample as Program<AsterizmTokenExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const name = "asterizm";
  const amount = new BN(930);
  const localChainId = new BN(1000);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
  });

  it("Send init Message", async () => {
    const message = new TokenMessage(program.methods);

    const srcAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const tokenClientAccount = await program.account.tokenClientAccount.fetch(
        srcAddress
    );

    const txId = tokenClientAccount.txId;

    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        srcAddress,
        chainId
    );

    const clientTrustedAddress =
        await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const mintPda = getMintPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const from = await resolveAssociatedTokenAccount(mintPda, payer!);
    const ownerTokenAccount = await getAssociatedTokenAddress(
        mintPda,
        tokenClientOwner.publicKey
    );
    const systemFeeAddress = tokenClientAccount.systemFeeAddress;
    const systemTokenAccount = await getAssociatedTokenAddress(
        mintPda,
        systemFeeAddress
    );

    const { ownerFee, systemFee, netAmount } = calculateFees(
        amount,
        FEE_RATES.OWNER_FEE_RATE,
        FEE_RATES.SYSTEM_FEE_RATE
    );

    // Get balances before send
    const senderBalanceBefore = await getTokenAccountBalance(from);
    const ownerBalanceBefore = await getTokenAccountBalance(ownerTokenAccount);
    const systemBalanceBefore = await getTokenAccountBalance(
        systemTokenAccount
    );

    const payload = serializeMessagePayloadEthers({
      to: dstAddress,
      amount: netAmount,
      txId,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: chainId!,
      payload,
      srcAddress,
      srcChainId: localChainId!,
      txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    await message.send(
        payer!,
        tokenClientOwner.publicKey,
        chainId,
        dstAddress,
        amount,
        name,
        mintPda,
        from,
        transferHash,
        trustedAddressPda
    );

    // Get balances after send
    const senderBalanceAfter = await getTokenAccountBalance(from);
    const ownerBalanceAfter = await getTokenAccountBalance(ownerTokenAccount);
    const systemBalanceAfter = await getTokenAccountBalance(systemTokenAccount);

    // Verify sender balance: initial - amount (burned)
    const expectedSenderBalance = new BN(senderBalanceBefore).sub(amount);
    assert.ok(
        senderBalanceAfter === expectedSenderBalance.toString(),
        `Sender balance should be ${expectedSenderBalance} but got ${senderBalanceAfter}`
    );

    // Verify fees were credited
    assertFeeCreditedToAccount(
        new BN(ownerBalanceBefore),
        new BN(ownerBalanceAfter),
        ownerFee
    );
    assertFeeCreditedToAccount(
        new BN(systemBalanceBefore),
        new BN(systemBalanceAfter),
        systemFee
    );
  });
});
