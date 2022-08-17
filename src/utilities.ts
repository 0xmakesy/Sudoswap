import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"

export function plusBigDecimal(originalVal: BigDecimal | null, addedVal: BigDecimal | null): BigDecimal {
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
        return BigDecimal.fromString("0.0")
    }
}

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

export function timesBigDecimal(originalVal: BigDecimal | null, multipliedVal: BigDecimal | null): BigDecimal {
    if (originalVal && multipliedVal) {
        return originalVal.times(multipliedVal)
    }
    else {
        return BigDecimal.fromString("0.0")
    }
}

export function minusBigDecimal(originalVal: BigDecimal | null, subtractedVal: BigDecimal | null): BigDecimal {
    if (originalVal && subtractedVal) {
        return originalVal.minus(subtractedVal)
    }
    else if (subtractedVal && !originalVal) {
        return BigDecimal.fromString("0.0").minus(subtractedVal)
    }
    else if (originalVal && !subtractedVal) {
        return originalVal
    }
    else {
        return BigDecimal.fromString("0.0")
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