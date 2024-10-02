import { PublicKey } from "@solana/web3.js";
import { decodeBase58, ethers } from "ethers";

export type NftMessagePayloadModelEthers = {
    to: PublicKey;
    id: Buffer;
    uri: string;
};

export const serializeNftMessagePayloadEthers = (
    payload: NftMessagePayloadModelEthers
) => {
    let serialized = ethers.solidityPacked(["uint256", "uint256", "string"],
        [
            decodeBase58(payload.to.toBase58()),
            ethers.getBigInt('0x' + payload.id.toString('hex')),
            payload.uri,
        ],
    )
    return Uint8Array.from(Buffer.from(serialized.substring(2), "hex"));
};
