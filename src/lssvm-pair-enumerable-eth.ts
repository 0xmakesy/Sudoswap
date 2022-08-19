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
  PoolNFTBuys,
  PoolNFTSales,
  ProtocolFeeMultiplier,
  SpotPriceUpdate,
  TokenDeposit,
  TokenWithdrawal
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts";
import { plusBigInt } from "./utilities"

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
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
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
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
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
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
  if (pair) {
    pair.fee = event.params.newFee
    pair.updatedAt = event.block.timestamp
    pair.save()
  }
}

export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {
  let entity = new NFTWithdrawal(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
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
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
  if (pair) {
    pair.owner = event.params.newOwner.toHexString()
    pair.updatedAt = event.block.timestamp
    pair.save()
  }
}

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let entity = new SpotPriceUpdate(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newSpotPrice = event.params.newSpotPrice
  entity.updateTx = event.transaction.hash.toHexString()
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
  if (pair) {
    pair.spotPrice = event.params.newSpotPrice
    pair.updatedAt = event.block.timestamp
    pair.save()
    entity.nft = pair.nft
  }
  entity.save()
}

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {
  let entity = new PoolNFTBuys(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = Pair.load(event.address.toHexString())!
  let protocolFeeMultiplier = ProtocolFeeMultiplier.load("current")!.protocolFeeMultiplier
  updatePairAttributesIfMissing(pair)
  pair.inventoryCount = pair.inventoryCount!.plus(BigInt.fromI32(1))
  entity.fee = pair.fee!
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
  dailyETHProtocolStats.numSells = plusBigInt(dailyETHProtocolStats.numSells, BigInt.fromI32(1))
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
  dailyPairStats.numSells = plusBigInt(dailyPairStats.numSells, BigInt.fromI32(1))
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
  let entity = new PoolNFTSales(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = Pair.load(event.address.toHexString())!
  let protocolFeeMultiplier = ProtocolFeeMultiplier.load("current")!
  updatePairAttributesIfMissing(pair)
  pair.inventoryCount = pair.inventoryCount!.minus(BigInt.fromI32(1))
  entity.fee = pair.fee!
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
  dailyETHProtocolStats.numBuys = plusBigInt(dailyETHProtocolStats.numBuys, BigInt.fromI32(1))
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
  dailyPairStats.numSells = plusBigInt(dailyPairStats.numSells, BigInt.fromI32(1))
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
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
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
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let entity = new TokenWithdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  let pair = Pair.load(event.address.toHexString())!
  updatePairAttributesIfMissing(pair)
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
}

export function updatePairAttributesIfMissing(pair: Pair): void {
  if (!pair.spotPrice) {
    let newPair = NewPair.load(pair.createdTx!)!
    pair.assetRecipient = pair.assetRecipient || newPair.initialAssetRecipient
    pair.bondingCurveAddress = pair.bondingCurveAddress || newPair.initialBondingCurveAddress
    pair.delta = pair.delta || newPair.initialDelta
    pair.fee = pair.fee || newPair.initialFee
    pair.inventoryCount = pair.inventoryCount || newPair.initialInventoryCount
    pair.nft = pair.nft || newPair.nft
    pair.owner = pair.owner || newPair.owner
    pair.poolType = pair.poolType || newPair.poolType
    pair.spotPrice = pair.spotPrice || newPair.initialSpotPrice
    pair.ethLiquidity = pair.ethLiquidity || newPair.initialETHLiquidity
    pair.save()
  }
}
