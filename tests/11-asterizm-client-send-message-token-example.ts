import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import {getSettingsPda, getTokenClientAccountPda, getTrustedAccountPda} from "../sdk/ts/pda";
import { getPayerFromConfig, tokenClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {CLIENT_PROGRAM_ID, RELAYER_PROGRAM_ID, TOKEN_EXAMPLE_PROGRAM_ID} from "../sdk/ts/program";
import { ClientMessage } from "../sdk/ts/client/message";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { serializeMessagePayloadEthers } from "../sdk/ts/message-payload-serializer-ethers";

describe("Asterizm client send message for token example tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  let payer: null | Keypair = null;
  let systemRelayOwner: null | PublicKey = null;
  let relayOwner: null | PublicKey = null;
  let relayerSettingsPda: null | PublicKey = null;
  let localChainId: null | BN = null;
  const chainId = new BN(1);
  const amount = new BN(866);
  const value = new BN(999);
  const name = "asterizm";

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(payer.publicKey);
    relayerSettingsPda = getSettingsPda(RELAYER_PROGRAM_ID);
    const settings = await program.account.relayerSettings.fetch(
        relayerSettingsPda!
    );
    systemRelayOwner = settings.systemRelayerOwner;
    relayOwner = payer!.publicKey;
    localChainId = settings.localChainId;
  });

  it("Send Message", async () => {
    const message = new ClientMessage(program.methods);

    const srcAddress = getTokenClientAccountPda(
        TOKEN_EXAMPLE_PROGRAM_ID,
        tokenClientOwner.publicKey,
        name
    );

    const txId = new BN(0);

    const trustedAddressPda = getTrustedAccountPda(
        CLIENT_PROGRAM_ID,
        srcAddress,
        chainId
    );

    const clientTrustedAddress =
        await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const payload = serializeMessagePayloadEthers({
      to: dstAddress,
      amount,
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
        tokenClientOwner,
        srcAddress,
        dstAddress,
        relayOwner!,
        systemRelayOwner!,
        localChainId!,
        chainId,
        txId,
        transferHash,
        value
    );
  });
});
