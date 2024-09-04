import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { decodeBase58, ethers } from "ethers";

export type NftMessagePayloadModelEthers = {
  to: PublicKey;
  id: Buffer;
  uri: string;
};

export const serializeNftMessagePayloadEthers = (
  payload: NftMessagePayloadModelEthers
) => {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  let serialized = abiCoder.encode(
    ["tuple(uint256, uint256, string)"],
    [
      [
        decodeBase58(payload.to.toBase58()),
        ethers.getBigInt('0x' + payload.id.toString('hex')),
        payload.uri,
      ],
    ]
  );
  return Uint8Array.from(Buffer.from(serialized.substring(2), "hex"));
};
