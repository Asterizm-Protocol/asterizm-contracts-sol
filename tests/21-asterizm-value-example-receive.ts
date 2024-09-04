import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AsterizmValueExample } from "../target/types/asterizm_value_example";
import { getClientAccountPda, getTrustedAccountPda } from "../sdk/ts/pda";
import { getPayerFromConfig, valueClientOwner } from "./utils/testing";
import { fundWalletWithSOL } from "../sdk/ts/utils";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { CLIENT_PROGRAM_ID, VALUE_EXAMPLE_PROGRAM_ID } from "../sdk/ts/program";
import { serializePayloadEthers } from "../sdk/ts/payload-serializer-ethers";
import { sha256 } from "js-sha256";
import { InitializeValue } from "../sdk/ts/value/initialize";
import { ValueMessage } from "../sdk/ts/value/message";
import { serializeValueMessagePayloadEthers } from "../sdk/ts/value-message-payload-serializer-ethers";

describe("Asterizm value example receive message tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .AsterizmValueExample as Program<AsterizmValueExample>;
  let payer: null | Keypair = null;
  const chainId = new BN(1);
  const localChainId = new BN(1000);
  const txId = 1;
  const amount = new BN(123);

  before(async () => {
    await fundWalletWithSOL(provider.wallet.publicKey);
    payer = await getPayerFromConfig();
    await fundWalletWithSOL(valueClientOwner.publicKey);
  });

  it("Create Client", async () => {
    const init = new InitializeValue(program.methods);

    await init.createClient(valueClientOwner);
  });

  it("Receive Message", async () => {
    const valueMessage = new ValueMessage(program.methods);
    const dstAddress = valueClientOwner.publicKey;
    const to = payer!.publicKey;

    const trustedAddressPda = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      chainId
    );

    const clientTrustedAddress =
      await program.account.clientTrustedAddress.fetch(trustedAddressPda);

    const srcAddress = clientTrustedAddress.address;

    const payload = serializeValueMessagePayloadEthers({
      to,
      amount,
      txId,
    });

    const payloadSerialized = serializePayloadEthers({
      dstAddress,
      dstChainId: localChainId!,
      payload,
      srcAddress,
      srcChainId: chainId!,
      txId,
    });

    const transferHash = sha256.array(payloadSerialized);

    const clientAccountPda = getClientAccountPda(CLIENT_PROGRAM_ID, dstAddress);

    await valueMessage.receive(
      valueClientOwner,
      transferHash,
      chainId,
      srcAddress,
      txId,
      Buffer.from(payload),
      clientAccountPda,
      trustedAddressPda,
      dstAddress
    );
  });
});
