import {
  AssetRecipientChange as AssetRecipientChangeEvent,
  DeltaUpdate as DeltaUpdateEvent,
  FeeUpdate as FeeUpdateEvent,
  NFTWithdrawal as NFTWithdrawalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SpotPriceUpdate as SpotPriceUpdateEvent,
  SwapNFTInPair as SwapNFTInPairEvent,
  SwapNFTOutPair as SwapNFTOutPairEvent,
  TokenDeposit as TokenDepositEvent,
  TokenWithdrawal as TokenWithdrawalEvent
} from "../generated/templates/LSSVMPairEnumerableETH/LSSVMPairEnumerableETH"
import {
  AssetRecipientChange,
  DailyETHPairStat,
  DailyETHPoolStat,
  DailyETHProtocolStat,
  DeltaUpdate,
  FeeUpdate,
  NewPair,
  NFTWithdrawal,
  OwnershipTransferred,
  Pair,
  PoolNFTBuy,
  PoolNFTSale,
  ProtocolFeeMultiplier,
  SpotPrice,
  TokenDeposit,
  TokenWithdrawal
} from "../generated/schema"
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { plusBigInt, updatePairAttributesIfMissing } from "./utilities"

export function handleAssetRecipientChange(
  event: AssetRecipientChangeEvent
): void {
  let entity = new AssetRecipientChange(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.a = event.params.a
  entity.timestamp = event.block.timestamp
  entity.pair = event.address.toHexString()
  entity.save()
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  if (pair) {
    pair.assetRecipient = event.params.a.toHexString()
    pair.updatedAt = event.block.timestamp
  }
}

export function handleDeltaUpdate(event: DeltaUpdateEvent): void {
  let entity = new DeltaUpdate(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newDelta = event.params.newDelta
  entity.timestamp = event.block.timestamp
  entity.pair = event.address.toHexString()
  entity.save()
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  if (pair) {
    pair.delta = event.params.newDelta
    pair.updatedAt = event.block.timestamp
  }
}

export function handleFeeUpdate(event: FeeUpdateEvent): void {
  let entity = new FeeUpdate(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newFee = event.params.newFee
  entity.timestamp = event.block.timestamp
  entity.pair = event.address.toHexString()
  entity.save()
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  if (pair) {
    pair.feeMultiplier = event.params.newFee.toBigDecimal().div(BigDecimal.fromString((Math.pow(10, 18)).toString()))
    pair.updatedAt = event.block.timestamp
    pair.save()
  }
}

export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {
  let entity = new NFTWithdrawal(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  pair.inventoryCount = pair.inventoryCount!.minus(BigInt.fromI32(1))
  entity.timestamp = event.block.timestamp
  entity.pair = event.address.toHexString()
  entity.save()

  const dayString = new Date(event.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
  if (!dailyETHProtocolStats) {
    dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
    dailyETHProtocolStats.nftsWithdrawn = BigInt.fromI32(0)
  }
  dailyETHProtocolStats.nftsWithdrawn = plusBigInt(dailyETHProtocolStats.nftsWithdrawn, BigInt.fromI32(1))

  let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
  if (!dailyPairStats) {
    dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
    dailyPairStats.nftsWithdrawn = BigInt.fromI32(0)
  }
  dailyPairStats.nftsWithdrawn = plusBigInt(dailyPairStats.nftsWithdrawn, BigInt.fromI32(1))

  let dailyPoolStats = DailyETHPoolStat.load(pair.nft + "-" + dayString)
  if (!dailyPoolStats) {
    dailyPoolStats = new DailyETHPoolStat(pair.nft + "-" + dayString)
    dailyPoolStats.nftsWithdrawn = BigInt.fromI32(0)
  }
  dailyPoolStats.nftsWithdrawn = plusBigInt(dailyPoolStats.nftsWithdrawn, BigInt.fromI32(1))
  dailyETHProtocolStats.save()
  dailyPairStats.save()
  dailyPoolStats.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newOwner = event.params.newOwner
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  entity.save()
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  if (pair) {
    pair.owner = event.params.newOwner.toHexString()
    pair.updatedAt = event.block.timestamp
    pair.save()
  }
}

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let entity = new SpotPrice(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newSpotPrice = event.params.newSpotPrice
  entity.updateTx = event.transaction.hash.toHexString()
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  if (pair) {
    pair.spotPrice = event.params.newSpotPrice
    pair.updatedAt = event.block.timestamp
    pair.save()
    entity.nft = pair.nft
  }
  entity.save()
}

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {
  let entity = new PoolNFTBuy(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  let protocolFeeMultiplier = ProtocolFeeMultiplier.load("current")!.protocolFeeMultiplier
  pair.inventoryCount = pair.inventoryCount!.plus(BigInt.fromI32(1))
  entity.fee = BigInt.fromString(pair.feeMultiplier!.times(pair.spotPrice!.toBigDecimal()).toString().split('.')[0])
  entity.pair = event.address.toHexString()
  entity.protocolFee = BigInt.fromString(protocolFeeMultiplier.times(pair.spotPrice!.toBigDecimal()).toString().split('.')[0])
  entity.ethPaidByPool = pair.spotPrice!
  entity.timestamp = event.block.timestamp
  entity.nft = pair.nft!
  entity.save()
  const dayString = new Date(entity.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
  if (!dailyETHProtocolStats) {
    dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
  }
  dailyETHProtocolStats.swapVolumeETH = plusBigInt(pair.spotPrice!, dailyETHProtocolStats.swapVolumeETH)
  dailyETHProtocolStats.approxProtocolFees = plusBigInt(dailyETHProtocolStats.approxProtocolFees, entity.protocolFee)
  dailyETHProtocolStats.numSwaps = plusBigInt(dailyETHProtocolStats.numSwaps, BigInt.fromI32(1))
  dailyETHProtocolStats.numUserSells = plusBigInt(dailyETHProtocolStats.numUserSells, BigInt.fromI32(1))
  dailyETHProtocolStats.approxPoolFees = plusBigInt(dailyETHProtocolStats.approxPoolFees, entity.fee)


  // Produce pair (LP level) ETH buy stats
  let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
  if (!dailyPairStats) {
    dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
  }
  dailyPairStats.dayString = dayString
  dailyPairStats.pair = entity.pair
  dailyPairStats.nftContract = pair.nft
  dailyPairStats.numSwaps = plusBigInt(dailyPairStats.numSwaps, BigInt.fromI32(1))
  dailyPairStats.numUserSells = plusBigInt(dailyPairStats.numUserSells, BigInt.fromI32(1))
  dailyPairStats.swapVolumeETH = plusBigInt(dailyPairStats.swapVolumeETH, pair.spotPrice)
  dailyPairStats.approxPairFees = plusBigInt(dailyPairStats.approxPairFees, entity.fee)
  dailyPairStats.approxProtocolFees = plusBigInt(dailyPairStats.approxProtocolFees, entity.protocolFee)


  // Produce pool (NFT) level ETH buy stats
  let dailyPoolStats = DailyETHPoolStat.load(entity.nft + "-" + dayString)
  if (!dailyPoolStats) {
    dailyPoolStats = new DailyETHPoolStat(entity.nft + "-" + dayString)
  }
  dailyPoolStats.dayString = dayString
  dailyPoolStats.nftContract = pair.nft
  dailyPoolStats.numSwaps = plusBigInt(dailyPoolStats.numSwaps, BigInt.fromI32(1))
  dailyPoolStats.numUserSells = plusBigInt(dailyPoolStats.numUserSells, BigInt.fromI32(1))
  dailyPoolStats.swapVolumeETH = plusBigInt(dailyPoolStats.swapVolumeETH, pair.spotPrice)
  dailyPoolStats.approxPoolFees = plusBigInt(dailyPoolStats.approxPoolFees, entity.fee)
  dailyPoolStats.approxProtocolFees = plusBigInt(dailyPoolStats.approxProtocolFees, entity.protocolFee)

  dailyETHProtocolStats.approxPoolSpent = plusBigInt(dailyETHProtocolStats.approxPoolSpent, entity.ethPaidByPool)
  dailyPairStats.approxPairSpent = plusBigInt(dailyPairStats.approxPairSpent, entity.ethPaidByPool)
  dailyPoolStats.approxPoolSpent = plusBigInt(dailyETHProtocolStats.approxPoolSpent, entity.ethPaidByPool)

  dailyETHProtocolStats.save()
  dailyPairStats.save()
  dailyPoolStats.save()
}

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {
  let entity = new PoolNFTSale(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  let protocolFeeMultiplier = ProtocolFeeMultiplier.load("current")!
  pair.inventoryCount = pair.inventoryCount!.minus(BigInt.fromI32(1))
  entity.fee = BigInt.fromString(pair.feeMultiplier!.times(pair.spotPrice!.toBigDecimal()).toString().split('.')[0])
  entity.pair = event.address.toHexString()
  entity.protocolFee = BigInt.fromString(protocolFeeMultiplier.protocolFeeMultiplier.times(pair.spotPrice!.toBigDecimal()).toString().split('.')[0])
  entity.ethReceivedByPool = pair.spotPrice!.minus(entity.protocolFee)
  entity.timestamp = event.block.timestamp
  entity.nft = pair.nft!
  entity.save()
  const dayString = new Date(entity.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
  if (!dailyETHProtocolStats) {
    dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
  }
  dailyETHProtocolStats.swapVolumeETH = plusBigInt(pair.spotPrice!, dailyETHProtocolStats.swapVolumeETH)
  dailyETHProtocolStats.approxProtocolFees = plusBigInt(dailyETHProtocolStats.approxProtocolFees, entity.protocolFee)
  dailyETHProtocolStats.numSwaps = plusBigInt(dailyETHProtocolStats.numSwaps, BigInt.fromI32(1))
  dailyETHProtocolStats.numUserBuys = plusBigInt(dailyETHProtocolStats.numUserBuys, BigInt.fromI32(1))
  dailyETHProtocolStats.approxPoolFees = plusBigInt(dailyETHProtocolStats.approxPoolFees, entity.fee)


  // Produce pair (LP level) ETH buy stats
  let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
  if (!dailyPairStats) {
    dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
  }
  dailyPairStats.dayString = dayString
  dailyPairStats.pair = entity.pair
  dailyPairStats.nftContract = pair.nft
  dailyPairStats.numSwaps = plusBigInt(dailyPairStats.numSwaps, BigInt.fromI32(1))
  dailyPairStats.numUserBuys = plusBigInt(dailyPairStats.numUserBuys, BigInt.fromI32(1))
  dailyPairStats.swapVolumeETH = plusBigInt(dailyPairStats.swapVolumeETH, pair.spotPrice)
  dailyPairStats.approxPairFees = plusBigInt(dailyPairStats.approxPairFees, entity.fee)
  dailyPairStats.approxProtocolFees = plusBigInt(dailyPairStats.approxProtocolFees, entity.protocolFee)

  // Produce pool (NFT) level ETH buy stats
  let dailyPoolStats = DailyETHPoolStat.load(entity.nft + "-" + dayString)
  if (!dailyPoolStats) {
    dailyPoolStats = new DailyETHPoolStat(entity.nft + "-" + dayString)
  }
  dailyPoolStats.dayString = dayString
  dailyPoolStats.nftContract = pair.nft
  dailyPoolStats.numSwaps = plusBigInt(dailyPoolStats.numSwaps, BigInt.fromI32(1))
  dailyPoolStats.numUserBuys = plusBigInt(dailyPoolStats.numUserBuys, BigInt.fromI32(1))
  dailyPoolStats.swapVolumeETH = plusBigInt(dailyPoolStats.swapVolumeETH, pair.spotPrice)
  dailyPoolStats.approxPoolFees = plusBigInt(dailyPoolStats.approxPoolFees, entity.fee)
  dailyPoolStats.approxProtocolFees = plusBigInt(dailyPoolStats.approxProtocolFees, entity.protocolFee)

  dailyETHProtocolStats.approxPoolRevenue = plusBigInt(dailyETHProtocolStats.approxPoolRevenue, entity.ethReceivedByPool)
  dailyPairStats.approxPairRevenue = plusBigInt(dailyPairStats.approxPairRevenue, entity.ethReceivedByPool)
  dailyPoolStats.approxPoolRevenue = plusBigInt(dailyETHProtocolStats.approxPoolRevenue, entity.ethReceivedByPool)

  dailyETHProtocolStats.save()
  dailyPairStats.save()
  dailyPoolStats.save()
}

export function handleTokenDeposit(
  event: TokenDepositEvent
): void {
  let entity = new TokenDeposit(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  entity.amountDeposited = event.params.amount
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  pair.ethLiquidity = pair.ethLiquidity!.plus(event.params.amount)
  entity.save()

  const dayString = new Date(event.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
  if (!dailyETHProtocolStats) {
    dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
    dailyETHProtocolStats.ethDeposited = BigInt.fromI32(0)
  }
  dailyETHProtocolStats.ethDeposited = plusBigInt(dailyETHProtocolStats.ethDeposited, entity.amountDeposited)

  let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
  if (!dailyPairStats) {
    dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
    dailyPairStats.ethDeposited = BigInt.fromI32(0)
  }
  dailyPairStats.ethDeposited = plusBigInt(dailyPairStats.ethDeposited, entity.amountDeposited)

  let dailyPoolStats = DailyETHPoolStat.load(pair.nft + "-" + dayString)
  if (!dailyPoolStats) {
    dailyPoolStats = new DailyETHPoolStat(pair.nft + "-" + dayString)
    dailyPoolStats.ethDeposited = BigInt.fromI32(0)
  }
  dailyPoolStats.ethDeposited = plusBigInt(dailyPoolStats.ethDeposited, entity.amountDeposited)
  dailyETHProtocolStats.save()
  dailyPairStats.save()
  dailyPoolStats.save()
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let entity = new TokenWithdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = updatePairAttributesIfMissing(Pair.load(event.address.toHexString())!)
  entity.amountWithdrawn = event.params.amount
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  pair.ethLiquidity = pair.ethLiquidity!.minus(event.params.amount)
  entity.save()

  const dayString = new Date(event.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let dailyETHProtocolStats = DailyETHProtocolStat.load(dayString)
  if (!dailyETHProtocolStats) {
    dailyETHProtocolStats = new DailyETHProtocolStat(dayString)
    dailyETHProtocolStats.ethWithdrawn = BigInt.fromI32(0)
  }
  dailyETHProtocolStats.ethWithdrawn = plusBigInt(dailyETHProtocolStats.ethWithdrawn, entity.amountWithdrawn)

  let dailyPairStats = DailyETHPairStat.load(pair.id + "-" + dayString)
  if (!dailyPairStats) {
    dailyPairStats = new DailyETHPairStat(pair.id + "-" + dayString)
    dailyPairStats.ethWithdrawn = BigInt.fromI32(0)
  }
  dailyPairStats.ethWithdrawn = plusBigInt(dailyPairStats.ethWithdrawn, entity.amountWithdrawn)

  let dailyPoolStats = DailyETHPoolStat.load(pair.nft + "-" + dayString)
  if (!dailyPoolStats) {
    dailyPoolStats = new DailyETHPoolStat(pair.nft + "-" + dayString)
    dailyPoolStats.ethWithdrawn = BigInt.fromI32(0)
  }
  dailyPoolStats.ethWithdrawn = plusBigInt(dailyPoolStats.ethWithdrawn, entity.amountWithdrawn)
  dailyETHProtocolStats.save()
  dailyPairStats.save()
  dailyPoolStats.save()
}
