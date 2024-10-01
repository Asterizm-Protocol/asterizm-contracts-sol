import {  PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { decodeBase58, ethers } from "ethers";
import {sha256} from "js-sha256";


export type PayloadModelEthers = {
  srcChainId: BN;
  srcAddress: PublicKey;
  dstChainId: BN;
  dstAddress: PublicKey;
  txId: BN;
  payload: Uint8Array;
};

export const serializePayloadEthers = (payload: PayloadModelEthers) => {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  let serialized = abiCoder.encode(
      ["tuple(uint64, uint256, uint64, uint256, uint256, bytes)"],
      [
        [
          payload.srcChainId.toNumber(),
          decodeBase58(payload.srcAddress.toBase58()),
          payload.dstChainId.toNumber(),
          decodeBase58(payload.dstAddress.toBase58()),
          payload.txId.toNumber(),
          payload.payload,
        ],
      ]
  );
  return Uint8Array.from(Buffer.from(serialized.substring(2), 'hex'));
};

export const buildCrosschainHash = (packed: Uint8Array) => {
  const staticChunk = packed.slice(0, 112);
  let hash = sha256.array(staticChunk);

  const payloadChunk = packed.slice(112);
  const payloadLength = payloadChunk.length;
  const chunkLength = 127;
  for (let i = 0; i <= Math.floor(payloadChunk.length / chunkLength); i++) {
    const from = chunkLength * i;
    const chunk = payloadChunk.slice(from, Math.min(from + chunkLength, payloadLength));

    const encoded = new Uint8Array(64);
    encoded.set(hash, 0);
    encoded.set(sha256.array(chunk), 32);
    hash = sha256.array(encoded);
  }

  return hash;
}
