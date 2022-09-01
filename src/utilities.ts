import { BigInt } from "@graphprotocol/graph-ts"
import { NewPair, Pair } from "../generated/schema"

export function updatePairAttributesIfMissing(pair: Pair): Pair {
    if (!pair.spotPrice || !pair.nft) {
        let newPair = NewPair.load(pair.createdTx!)!
        pair.assetRecipient = pair.assetRecipient || newPair.initialAssetRecipient
        pair.bondingCurveAddress = pair.bondingCurveAddress || newPair.initialBondingCurveAddress
        pair.delta = pair.delta || newPair.initialDelta
        pair.feeMultiplier = pair.feeMultiplier || newPair.initialFeeMultiplier
        pair.inventoryCount = pair.inventoryCount || newPair.initialInventoryCount
        pair.nft = pair.nft || newPair.nft
        pair.owner = pair.owner || newPair.owner
        pair.poolType = pair.poolType || newPair.poolType
        pair.spotPrice = pair.spotPrice || newPair.initialSpotPrice
        pair.ethLiquidity = pair.ethLiquidity || newPair.initialETHLiquidity
        pair.save()
    }
    return pair
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

export function returnNonNullBigInt(originalVal: BigInt | null): BigInt {
    if (originalVal) {
        return originalVal
    }
    else {
        return BigInt.fromI32(0)
    }
}