import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmClient } from "../target/types/asterizm_client";
import { getSettingsPda, getTrustedAccountPda } from "../sdk/ts/pda";
import { tokenClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID } from "../sdk/ts/program";
import { ClientMessage } from "../sdk/ts/client/message";
import { sha256 } from "js-sha256";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";

describe("Asterizm client receive message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AsterizmClient as Program<AsterizmClient>;
  let settingsPda: null | PublicKey = null;
  let localChainId: null | BN = null;
  const chainId = new BN(1);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    await fundWalletWithSOL(tokenClientOwner.publicKey);
    settingsPda = getSettingsPda(CLIENT_PROGRAM_ID);
    const settings = await program.account.clientProgramSettings.fetch(
      settingsPda!
    );
    localChainId = settings.localChainId;
  });

  it("Receive Message", async () => {
    const message = new ClientMessage(program.methods);
    const dstAddress = tokenClientOwner.publicKey;
    const payload = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ]);
    const txId = 2;

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

    await message.receive(
      tokenClientOwner,
      dstAddress,
      chainId,
      srcAddress,
      Buffer.from(payload),
      incomingTransferHash,
      txId
    );
  });
});
