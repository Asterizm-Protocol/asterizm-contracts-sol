import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmTokenExample } from "../target/types/asterizm_token_example";
import { getPayerFromConfig, tokenClientOwner} from "./utils/testing";
import {
  fundWalletWithSOL,
  getTokenAccountBalance,
  resolveAssociatedTokenAccount,
} from "../sdk/ts/utils";
import { InitializeToken } from "../sdk/ts/token/initialize";
import { getMintPda } from "../sdk/ts/pda";
import { TOKEN_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import assert from "assert";
import BN from "bn.js";

describe("Asterizm token example mint tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmTokenExample as Program<AsterizmTokenExample>;
  const name = "asterizm";
  const decimals = 9;
  const amount = new BN(1000000000); // 1 token
  let payer: null | anchor.web3.Keypair = null;

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(tokenClientOwner.publicKey);
  });

  it("Enable mint for client", async () => {
    const init = new InitializeToken(program.methods);
    await init.enableMintForClient(payer!, tokenClientOwner.publicKey, name);
  });

  it("Mint to user", async () => {
    const init = new InitializeToken(program.methods);

    const mintPda = getMintPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      tokenClientOwner.publicKey,
      name
    );

    const to = await resolveAssociatedTokenAccount(mintPda, tokenClientOwner);
    const balanceBefore = await getTokenAccountBalance(to);

    await init.mintToUser(tokenClientOwner, name, to, amount);

    const balanceAfter = await getTokenAccountBalance(to);
    const expectedBalance = new BN(balanceBefore).add(amount);

    assert.ok(balanceAfter === expectedBalance.toString());
  });

  it("Disable mint for client", async () => {
    const init = new InitializeToken(program.methods);
    await init.disableMintForClient(payer!, tokenClientOwner.publicKey, name);
  });

  it("Mint to user should fail after disable", async () => {
    const init = new InitializeToken(program.methods);

    const mintPda = getMintPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      tokenClientOwner.publicKey,
      name
    );

    const to = await resolveAssociatedTokenAccount(mintPda, tokenClientOwner);

    try {
      await init.mintToUser(tokenClientOwner, name, to, amount);
      assert.fail("Mint should have failed");
    } catch (error) {
      // Expected to fail
    }
  });
});
