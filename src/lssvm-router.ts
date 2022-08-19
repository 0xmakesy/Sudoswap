/** No longer needed now that we're using contract events rather than call handlers for performance
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { SwapETHForSpecificNFTsCall, RobustSwapETHForSpecificNFTsCall } from "../generated/LSSVMRouter/LSSVMRouter"
import { SwapETHForSpecificNFT, Swap, DailyETHPairStat, DailyETHPoolStat, DailyETHProtocolStat, Pair, NewPair } from "../generated/schema"
import { plusBigDecimal, plusBigInt, timesBigDecimal, minusBigDecimal, returnNonNullBigInt } from "./utilities"

export function handleSwapETHForSpecificNFTs(call: SwapETHForSpecificNFTsCall): void {
    let transaction = new SwapETHForSpecificNFT(call.transaction.hash.toHexString())
    transaction.totalETHSpent = call.transaction.value
    transaction.ethRecipient = call.inputs.ethRecipient
    transaction.nftRecipient = call.inputs.nftRecipient
    transaction.timestamp = call.block.timestamp
    transaction.nftCount = 0
    transaction.collectionCount = call.inputs.swapList.length

    const dayString = new Date(call.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
    let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
    if (!dailyETHProtocolStats) {
        dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
    }
    dailyETHProtocolStats.swapVolumeETH = plusBigInt(call.transaction.value, dailyETHProtocolStats.swapVolumeETH)
    for (let i = 0; i < call.inputs.swapList.length; i++) {
        let swap = new Swap(call.inputs.swapList[i].pair.toHexString() + '-' + call.transaction.hash.toHexString())
        swap.pair = call.inputs.swapList[i].pair.toHexString()
        transaction.nftCount = transaction.collectionCount + call.inputs.swapList[i].nftIds.length
        swap.nftIds = call.inputs.swapList[i].nftIds.toString()
        swap.txHash = call.transaction.hash.toHexString()
        swap.swapTx = transaction.id
        let pair = Pair.load(swap.pair)!
        let newPair = NewPair.load(pair.createdTx!)!
        if (pair) {
            swap.ethPrice = returnNonNullBigInt(pair.spotPrice || newPair.initialSpotPrice)
            swap.approxProtocolFee = timesBigDecimal(BigDecimal.fromString("0.005"), swap.ethPrice.toBigDecimal())
            swap.approxPairFee = returnNonNullBigInt(pair.fee || newPair.initialFee)
            swap.approxPairRevenue = swap.ethPrice.minus(swap.approxPairFee).toBigDecimal().minus(swap.approxProtocolFee)
            swap.nft = pair.createdTx
        }
        dailyETHProtocolStats.approxProtocolFees = plusBigDecimal(dailyETHProtocolStats.approxProtocolFees, swap.approxProtocolFee)
        dailyETHProtocolStats.numSwaps = plusBigInt(dailyETHProtocolStats.numSwaps, BigInt.fromI32(1))
        dailyETHProtocolStats.approxPoolFees = plusBigInt(dailyETHProtocolStats.approxPoolFees, swap.approxPairFee)
        dailyETHProtocolStats.approxPoolRevenue = plusBigDecimal(dailyETHProtocolStats.approxPoolRevenue, swap.approxPairRevenue)
        dailyETHProtocolStats.save()
        let dailyPairStats = DailyETHPairStat.load(swap.pair + "-" + dayString)
        if (!dailyPairStats) {
            dailyPairStats = new DailyETHPairStat(swap.pair + "-" + dayString)
        }
        dailyPairStats.dayString = dayString
        dailyPairStats.pair = swap.pair
        dailyPairStats.nftContract = newPair.nft
        dailyPairStats.numSwaps = plusBigInt(dailyPairStats.numSwaps, BigInt.fromI32(1))
        dailyPairStats.swapVolumeETH = plusBigInt(dailyPairStats.swapVolumeETH, swap.ethPrice)
        dailyPairStats.approxPairFees = plusBigInt(dailyPairStats.approxPairFees, swap.approxPairFee)
        dailyPairStats.approxProtocolFees = plusBigDecimal(dailyPairStats.approxProtocolFees, swap.approxProtocolFee)
        dailyPairStats.approxPairRevenue = plusBigDecimal(dailyPairStats.approxPairRevenue, swap.approxPairRevenue)
        dailyPairStats.save()
        let dailyPoolStats = DailyETHPoolStat.load(newPair.nft + "-" + dayString)
        if (!dailyPoolStats) {
            dailyPoolStats = new DailyETHPoolStat(newPair.nft + "-" + dayString)
        }
        dailyPoolStats.dayString = dayString
        dailyPoolStats.nftContract = newPair.nft
        dailyPoolStats.numSwaps = plusBigInt(dailyPoolStats.numSwaps, BigInt.fromI32(1))
        dailyPoolStats.swapVolumeETH = plusBigInt(dailyPoolStats.swapVolumeETH, swap.ethPrice)
        dailyPoolStats.approxPoolFees = plusBigInt(dailyPoolStats.approxPoolFees, swap.approxPairFee)
        dailyPoolStats.approxProtocolFees = plusBigDecimal(dailyPoolStats.approxProtocolFees, swap.approxProtocolFee)
        dailyPoolStats.approxPoolRevenue = plusBigDecimal(dailyPoolStats.approxPoolRevenue, swap.approxPairRevenue)
        dailyPoolStats.save()
        swap.save()
    }
    transaction.save()
}

export function handleRobustSwapETHForSpecificNFTs(call: RobustSwapETHForSpecificNFTsCall): void {
    let transaction = new SwapETHForSpecificNFT(call.transaction.hash.toHexString())
    transaction.totalETHSpent = call.transaction.value
    transaction.ethRecipient = call.inputs.ethRecipient
    transaction.nftRecipient = call.inputs.nftRecipient
    transaction.timestamp = call.block.timestamp
    transaction.nftCount = 0
    transaction.collectionCount = call.inputs.swapList.length

    const dayString = new Date(call.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
    let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
    if (!dailyETHProtocolStats) {
        dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
    }
    dailyETHProtocolStats.swapVolumeETH = plusBigInt(call.transaction.value, dailyETHProtocolStats.swapVolumeETH)
    for (let i = 0; i < call.inputs.swapList.length; i++) {
        let swap = new Swap(call.inputs.swapList[i].swapInfo.pair.toHexString() + '-' + call.transaction.hash.toHexString())
        swap.pair = call.inputs.swapList[i].swapInfo.pair.toHexString()
        swap.nftIds = call.inputs.swapList[i].swapInfo.nftIds.toString()
        transaction.nftCount = transaction.nftCount + call.inputs.swapList[i].swapInfo.nftIds.length
        swap.maxCost = call.inputs.swapList[i].maxCost
        swap.txHash = call.transaction.hash.toHexString()
        swap.swapTx = call.transaction.hash.toHexString()
        let pair = Pair.load(swap.pair)!
        let newPair = NewPair.load(pair.createdTx!)!
        swap.ethPrice = returnNonNullBigInt(pair.spotPrice || newPair.initialSpotPrice)
        swap.approxProtocolFee = timesBigDecimal(BigDecimal.fromString("0.005"), swap.ethPrice.toBigDecimal())
        swap.approxPairFee = returnNonNullBigInt(pair.fee || newPair.initialFee)
        swap.approxPairRevenue = swap.ethPrice.minus(swap.approxPairFee).toBigDecimal().minus(swap.approxProtocolFee)
        swap.nft = pair.nft
        dailyETHProtocolStats.approxProtocolFees = plusBigDecimal(dailyETHProtocolStats.approxProtocolFees, swap.approxProtocolFee)
        dailyETHProtocolStats.numSwaps = plusBigInt(dailyETHProtocolStats.numSwaps, BigInt.fromI32(1))
        dailyETHProtocolStats.approxPoolFees = plusBigInt(dailyETHProtocolStats.approxPoolFees, swap.approxPairFee)
        dailyETHProtocolStats.approxPoolRevenue = plusBigDecimal(dailyETHProtocolStats.approxPoolRevenue, swap.approxPairRevenue)
        let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
        if (!dailyPairStats) {
            dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
        }
        dailyPairStats.dayString = dayString
        dailyPairStats.pair = swap.pair
        dailyPairStats.nftContract = swap.nft
        dailyPairStats.numSwaps = plusBigInt(dailyPairStats.numSwaps, BigInt.fromI32(1))
        dailyPairStats.swapVolumeETH = plusBigInt(dailyPairStats.swapVolumeETH, swap.ethPrice)
        dailyPairStats.approxPairFees = plusBigInt(dailyPairStats.approxPairFees, swap.approxPairFee)
        dailyPairStats.approxProtocolFees = plusBigDecimal(dailyPairStats.approxProtocolFees, swap.approxProtocolFee)
        dailyPairStats.approxPairRevenue = plusBigDecimal(dailyPairStats.approxPairRevenue, swap.approxPairRevenue)

        let dailyPoolStats = DailyETHPoolStat.load(newPair.nft + "-" + dayString)
        if (!dailyPoolStats) {
            dailyPoolStats = new DailyETHPoolStat(newPair.nft + "-" + dayString)
        }
        dailyPoolStats.dayString = dayString
        dailyPoolStats.nftContract = newPair.nft
        dailyPoolStats.numSwaps = plusBigInt(dailyPoolStats.numSwaps, BigInt.fromI32(1))
        dailyPoolStats.swapVolumeETH = plusBigInt(dailyPoolStats.swapVolumeETH, swap.ethPrice)
        dailyPoolStats.approxPoolFees = plusBigInt(dailyPoolStats.approxPoolFees, swap.approxPairFee)
        dailyPoolStats.approxProtocolFees = plusBigDecimal(dailyPoolStats.approxProtocolFees, swap.approxProtocolFee)
        dailyPoolStats.approxPoolRevenue = plusBigDecimal(dailyPoolStats.approxPoolRevenue, swap.approxPairRevenue)
        dailyETHProtocolStats.save()
        dailyPairStats.save()
        dailyPoolStats.save()
        swap.save()
    }
    transaction.save()
}
**/