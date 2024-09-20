import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { decodeBase58, ethers } from "ethers";

export type ValueMessagePayloadModelEthers = {
  to: PublicKey;
  amount: BN;
  txId: BN;
};

export const serializeValueMessagePayloadEthers = (
  payload: ValueMessagePayloadModelEthers
) => {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  let serialized = abiCoder.encode(
    ["tuple(uint256, uint64, uint256)"],
    [
      [
        decodeBase58(payload.to.toBase58()),
        payload.amount.toNumber(),
        payload.txId.toNumber(),
      ],
    ]
  );
  return Uint8Array.from(Buffer.from(serialized.substring(2), "hex"));
};
