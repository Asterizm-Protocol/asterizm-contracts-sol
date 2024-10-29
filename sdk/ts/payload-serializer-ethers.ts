import {  PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { decodeBase58, ethers } from "ethers";


export type PayloadModelEthers = {
  srcChainId: BN;
  srcAddress: PublicKey;
  dstChainId: BN;
  dstAddress: PublicKey;
  txId: BN;
  payload: Uint8Array;
};

export const serializePayloadEthers = (payload: PayloadModelEthers) => {
  let serialized = ethers.solidityPacked(["uint64", "uint256", "uint64", "uint256", "uint256", "bytes"],
      [
        payload.srcChainId.toNumber(),
        decodeBase58(payload.srcAddress.toBase58()),
        payload.dstChainId.toNumber(),
        decodeBase58(payload.dstAddress.toBase58()),
        payload.txId.toNumber(),
        payload.payload,
      ],
  )

  return Uint8Array.from(Buffer.from(serialized.substring(2), 'hex'));
};
