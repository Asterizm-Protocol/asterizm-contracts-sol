import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmRelayer } from "../target/types/asterizm_relayer";
import {getClientAccountPda, getTokenClientAccountPda, getTrustedAccountPda} from "../sdk/ts/pda";
import {getPayerFromConfig, tokenClientOwner} from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { RelayMessage } from "../sdk/ts/relayer/message";
import {CLIENT_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID} from "../sdk/ts/program";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";

describe("Asterizm relayer transfer message for token example", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmRelayer as Program<AsterizmRelayer>;
  let payer: null | Keypair = null;
  const localChainId = new BN(1000);
  const chainId = new BN(1);
  const txId = new BN(3);
  const amount = new BN(999);
  const name = "asterizm";

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
  });

  it("Transfer Message", async () => {
    const message = new RelayMessage(program.methods);
    const dstAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const to = payer!.publicKey;

    const payload = serializeMessagePayloadEthers({
      to,
      amount,
      txId,
    });

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const srcAddress = clientTrustedAddress.address;

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: localChainId!,
      payload,
      srcAddress,
      srcChainId: chainId!,
      txId: txId,
    });

    const incomingTransferHash = sha256.array(payloadSerialized);

    await message.transfer(
      payer!,
      payer!.publicKey,
      chainId,
      srcAddress,
      localChainId,
      dstAddress,
      txId,
      incomingTransferHash,
      clientAccountPda,
      trustedAddressPda
    );
  });
});
