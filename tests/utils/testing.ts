import {Keypair} from "@solana/web3.js";
import {promisify} from "util";
import {readFile} from "fs";
import {homedir} from "os";
import * as anchor from "@coral-xyz/anchor";

type ValidTransactionError = { message: string; logs?: Array<string> };

const isValidTransactionError = (
    err: unknown
): err is ValidTransactionError => {
    if (!err || typeof err !== "object") return false;
    const { message, logs } = err as any;
    return typeof message === "string" && (!logs || Array.isArray(logs));
};

export const resolveTxError = (err: unknown): ValidTransactionError => {
    if (!isValidTransactionError(err)) {
        console.error(err);
        throw new Error("recieved non-anchor error (see error output above)");
    }
    return err;
};

export const shouldFail = async (
    testFn: () => Promise<any>,
    expectedError:
        | {
        code: string;
        num: number;
    }
        | string
) => {
    try {
        await testFn();
    } catch (e: unknown) {
        const error = resolveTxError(e);
        const sbstr =
            typeof expectedError === "string"
                ? expectedError
                : `Error Code: ${expectedError.code}. Error Number: ${expectedError.num}`;
        const pred =
            error.message.includes(sbstr) ||
            error.logs?.some((lg) => lg.includes(sbstr));
        if (pred) {
            // test success
            return;
        }
        const { message, logs } = error;
        console.error(`${message}\n${(logs || []).join("\n")}`);
        throw new Error(`expected tx to throw error that includes '${sbstr}'`);
    }
    throw new Error("expected tx to throw error, but it succeeded");
};

export const shouldSucceed = async (testFn: () => Promise<any>) => {
    try {
        await testFn();
    } catch (e: unknown) {
        const error = resolveTxError(e);
        const { message, logs } = error;
        console.error(`${message}\n${(logs || []).join("\n")}`);
        throw new Error(`expected tx to succeeed, but error was thrown`);
    }
};

export async function getPayerFromConfig() {
    return Keypair.fromSecretKey(
        Buffer.from(
            JSON.parse(
                await promisify(readFile)(homedir() + "/.config/solana/id.json", {
                    encoding: "utf-8",
                })
            )
        )
    );
}
export async function getPayer2FromConfig() {
    return Keypair.fromSecretKey(
        Buffer.from(
            JSON.parse(
                await promisify(readFile)(homedir() + "/.config/solana/id2.json", {
                    encoding: "utf-8",
                })
            )
        )
    );
}

export const tokenClientOwner = anchor.web3.Keypair.generate();
export const nativeTokenClientOwner = anchor.web3.Keypair.generate();
export const nativeTokenMint = anchor.web3.Keypair.generate();
export const nftClientOwner = anchor.web3.Keypair.generate();
export const valueClientOwner = anchor.web3.Keypair.generate();
export const nftMint = anchor.web3.Keypair.generate();
export const nftTrustedUserAddress = anchor.web3.Keypair.generate();
export const tokenSystemAccount = anchor.web3.Keypair.generate();
export const trustedUserAddress = anchor.web3.Keypair.generate();
