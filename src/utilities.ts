import { BigInt } from "@graphprotocol/graph-ts"

export function plusBigInt(originalVal: BigInt | null, addedVal: BigInt | null): BigInt {
    if (originalVal && addedVal) {
        return originalVal.plus(addedVal)
    }
    else if (addedVal && !originalVal) {
        return addedVal
    }
    else if (originalVal && !addedVal) {
        return originalVal
    }
    else {
        return BigInt.fromI32(0)
    }
}

export function returnNonNullBigInt(originalVal: BigInt | null): BigInt {
    if (originalVal) {
        return originalVal
    }
    else {
        return BigInt.fromI32(0)
    }
}