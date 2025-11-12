import { PublicKey } from "@solana/web3.js";
import { Program as IProgram } from "@coral-xyz/anchor";
import type { AsterizmRelayer } from "../../target/types/asterizm_relayer";
import type { AsterizmInitializer } from "../../target/types/asterizm_initializer";
import type { AsterizmClient } from "../../target/types/asterizm_client";
import type { AsterizmTokenExample } from "../../target/types/asterizm_token_example";
import type { AsterizmNativeTokenExample } from "../../target/types/asterizm_native_token_example";
import type { AsterizmNftExample } from "../../target/types/asterizm_nft_example";
import type { AsterizmValueExample } from "../../target/types/asterizm_value_example";
import * as anchor from "@coral-xyz/anchor";

export const RELAYER_PROGRAM_ID = new PublicKey(
  "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
);

export const INITIALIZER_PROGRAM_ID = new PublicKey(
  "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
);

export const CLIENT_PROGRAM_ID = new PublicKey(
  "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
);

export const TOKEN_EXAMPLE_PROGRAM_ID = new PublicKey(
  "ASWxijC9aT8vjBHm91AED6BjEEeZC5oSRVXwcSTgkd3s"
);

export const NATIVE_TOKEN_EXAMPLE_PROGRAM_ID = new PublicKey(
    "ASzKeKfU6HM6NZHdmuQL31uvU1Hw8Foj8y6Myky6Wp47"
);

export const NFT_EXAMPLE_PROGRAM_ID = new PublicKey(
  "ASPAGH1992btTDvmLELAWAAzj9J5tLyaDHdW4qaYxsnG"
);

export const VALUE_EXAMPLE_PROGRAM_ID = new PublicKey(
  "ASXrQjsqRT6YsE3xYio4i2LKjbLrGQqG4BQ77VfUsmEV"
);

export const BPF_UPGRADE_ID = new anchor.web3.PublicKey(
    "BPFLoaderUpgradeab1e11111111111111111111111"
);

export const ATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const getRelayerProgramDataAddress = () => {
  const [programDataAddress, _b] = anchor.web3.PublicKey.findProgramAddressSync(
      [RELAYER_PROGRAM_ID.toBytes()],
      BPF_UPGRADE_ID
  );
  return programDataAddress;
};

export const getInitializerProgramDataAddress = () => {
  const [programDataAddress, _b] = anchor.web3.PublicKey.findProgramAddressSync(
      [INITIALIZER_PROGRAM_ID.toBytes()],
      BPF_UPGRADE_ID
  );
  return programDataAddress;
};

export const getClientProgramDataAddress = () => {
  const [programDataAddress, _b] = anchor.web3.PublicKey.findProgramAddressSync(
      [CLIENT_PROGRAM_ID.toBytes()],
      BPF_UPGRADE_ID
  );
  return programDataAddress;
};

export type IRelayerProgramAPI = IProgram<AsterizmRelayer>["methods"];
export type IInitializerProgramAPI = IProgram<AsterizmInitializer>["methods"];
export type IClientProgramAPI = IProgram<AsterizmClient>["methods"];
export type ITokenExampleProgramAPI = IProgram<AsterizmTokenExample>["methods"];
export type INativeTokenExampleProgramAPI = IProgram<AsterizmNativeTokenExample>["methods"];
export type INftExampleProgramAPI = IProgram<AsterizmNftExample>["methods"];
export type IValueExampleProgramAPI = IProgram<AsterizmValueExample>["methods"];
