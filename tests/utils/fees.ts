import BN from "bn.js";

/**
 * Calculate fees based on amount and rates
 * @param amount - The amount to calculate fees for
 * @param ownerFeeRate - Owner fee rate (basis points, e.g., 500 = 5%)
 * @param systemFeeRate - System fee rate (basis points, e.g., 200 = 2%)
 * @returns Object with calculated fees and net amount
 */
export function calculateFees(
    amount: BN,
    ownerFeeRate: BN,
    systemFeeRate: BN
): { ownerFee: BN; systemFee: BN; totalFees: BN; netAmount: BN } {
    const ownerFee = amount.mul(ownerFeeRate).div(new BN(10000));
    const systemFee = amount.mul(systemFeeRate).div(new BN(10000));
    const totalFees = ownerFee.add(systemFee);
    const netAmount = amount.sub(totalFees);

    return {
        ownerFee,
        systemFee,
        totalFees,
        netAmount,
    };
}

/**
 * expects exact fee amounts
 * @param expectedFee - Expected fee amount
 * @param actualFee - Actual fee amount
 * @param tolerance - Allowed tolerance (default 0)
 */
export function assertFeeEqual(
    expectedFee: BN,
    actualFee: BN,
    tolerance: BN = new BN(0)
): void {
    const lowerBound = expectedFee.sub(tolerance);
    const upperBound = expectedFee.add(tolerance);

    if (actualFee.lt(lowerBound) || actualFee.gt(upperBound)) {
        throw new Error(
            `Fee mismatch: expected ${expectedFee.toString()}, got ${actualFee.toString()} (tolerance: ±${tolerance.toString()})`
        );
    }
}

/**
 * expects account balance change matches fee amount
 * @param initialBalance - Initial account balance
 * @param finalBalance - Final account balance
 * @param expectedFee - Expected fee credited to account
 */
export function assertFeeCreditedToAccount(
    initialBalance: BN,
    finalBalance: BN,
    expectedFee: BN
): void {
    const actualChange = finalBalance.sub(initialBalance);
    if (!actualChange.eq(expectedFee)) {
        throw new Error(
            `Fee credit mismatch: expected account to receive ${expectedFee.toString()}, but balance changed by ${actualChange.toString()}`
        );
    }
}

export const FEE_RATES = {
    OWNER_FEE_RATE: new BN(500), // 5%
    SYSTEM_FEE_RATE: new BN(200), // 2%
    TOTAL_FEE_RATE: new BN(700), // 7%
} as const;
