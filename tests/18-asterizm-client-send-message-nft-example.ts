import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import {
  getClientAccountPda,
  getNftClientAccountPda,
  getSettingsPda,
  getTrustedAccountPda,
} from "../sdk/ts/pda";
import { getPayerFromConfig, nftClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  CLIENT_PROGRAM_ID,
  NFT_EXAMPLE_PROGRAM_ID,
  RELAYER_PROGRAM_ID,
} from "../sdk/ts/program";
import { ClientMessage } from "../sdk/ts/client/message";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { serializeNftMessagePayloadEthers } from "../sdk/ts/nft-message-payload-serializer-ethers";

describe("Asterizm client send message for nft example tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  let payer: null | Keypair = null;
  let systemRelayOwner: null | PublicKey = null;
  let relayOwner: null | PublicKey = null;
  let relayerSettingsPda: null | PublicKey = null;
  let localChainId: null | BN = null;
  const chainId = new BN(1);
  const value = new BN(999);
  const uri = "https://google1.com";

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(nftClientOwner.publicKey);
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
    const srcAddress = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      nftClientOwner.publicKey
    );
    const id = payer!.publicKey.toBuffer();

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, srcAddress);

    const clientAccount = await program.account.clientAccount.fetch(
      clientAccountPda
    );

    const txId = clientAccount.txId - 1;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const dstAddress = clientTrustedAddress.address;

    const payload = serializeNftMessagePayloadEthers({
      to: dstAddress,
      id,
      uri,
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
      nftClientOwner,
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
