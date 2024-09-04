import { PublicKey } from "@solana/web3.js";
import { Program as IProgram } from "@coral-xyz/anchor";
import type { AsterizmRelayer } from "../../target/types/asterizm_relayer";
import type { AsterizmInitializer } from "../../target/types/asterizm_initializer";
import type { AsterizmClient } from "../../target/types/asterizm_client";
import type { AsterizmTokenExample } from "../../target/types/asterizm_token_example";
import type { AsterizmNftExample } from "../../target/types/asterizm_nft_example";
import type { AsterizmValueExample } from "../../target/types/asterizm_value_example";
import * as anchor from "@coral-xyz/anchor";

export const RELAYER_PROGRAM_ID = new PublicKey(
  "AsXCTmPnyFfxYGrymtL4wa56tk2GTBPu2q2nRAktMWyW"
);

export const INITIALIZER_PROGRAM_ID = new PublicKey(
  "AsE15Mep8EJundywoGRs2XbKY28HghJ7HZ4b7qN3uiJc"
);
export const CLIENT_PROGRAM_ID = new PublicKey(
  "As34Rx7ZJKc6JETxaYSZ7fHUkmhhBLhLzjMdTXJTuXDS"
);

export const TOKEN_EXAMPLE_PROGRAM_ID = new PublicKey(
  "AsUG3qmKKMjEYZDCTqo4hJEnLmxGj82SDGiXci1hNFBx"
);

export const NFT_EXAMPLE_PROGRAM_ID = new PublicKey(
  "AsGHptNAzEa1UXw4mWRy1WXmBsi11CMaZ2RJ9p6cn1SF"
);

export const VALUE_EXAMPLE_PROGRAM_ID = new PublicKey(
  "AsWKK9AMhadUi2GX7BptSCqyhLJBeCXoKbytoF28AuKR"
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
export type INftExampleProgramAPI = IProgram<AsterizmNftExample>["methods"];
export type IValueExampleProgramAPI = IProgram<AsterizmValueExample>["methods"];
