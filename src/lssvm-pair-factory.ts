import { BigInt } from "@graphprotocol/graph-ts"
// import { decodeEthFunctionInputs } from "./helpers"
import {
  LSSVMPairFactory,
  BondingCurveStatusUpdate as BondingCurveStatusUpdateEvent,
  CallTargetStatusUpdate,
  NFTDeposit,
  NewPair as NewPairEvent,
  OwnershipTransferred,
  ProtocolFeeMultiplierUpdate,
  ProtocolFeeRecipientUpdate,
  RouterStatusUpdate,
  TokenDeposit,
  CreatePairETHCall
} from "../generated/LSSVMPairFactory/LSSVMPairFactory"
import { NewPair, Pair, DailyETHPairStat, DailyETHPoolStat, DailyETHProtocolStat, BondingCurveStatusUpdate } from "../generated/schema"
import { LSSVMPairEnumerableETH } from "../generated/templates"
import { plusBigInt } from "./utilities"

export function handleCreatePairETH(
  event: CreatePairETHCall
): void {
  let newPair = NewPair.load(event.transaction.hash.toHexString())
  // todo: initial and current pair attributes/counts
  if (!newPair) {
    newPair = new NewPair(event.transaction.hash.toHexString())
  }
  newPair.nft = event.inputs._nft.toHexString()
  newPair.initialBondingCurveAddress = event.inputs._bondingCurve.toHexString()
  newPair.initialAssetRecipient = event.inputs._assetRecipient.toHexString()
  newPair.poolType = BigInt.fromI32(event.inputs._poolType)
  newPair.initialDelta = event.inputs._delta
  newPair.initialFee = event.inputs._fee
  newPair.initialSpotPrice = event.inputs._spotPrice
  newPair.initialNFTIdInventory = event.inputs._initialNFTIDs
  newPair.initialInventoryCount = BigInt.fromI32(event.inputs._initialNFTIDs.length)
  newPair.owner = event.from.toHexString()
  newPair.save()
  const dayString = new Date(event.block.timestamp.toI64() * 1000).toISOString().slice(0, 10).replaceAll("-", "")
  let poolStats = DailyETHPoolStat.load(newPair.nft + "-" + dayString)
  // todo: initial and current pair attributes/counts
  if (!poolStats) {
    poolStats = new DailyETHPoolStat(newPair.nft + "-" + dayString)
    poolStats.dayString = dayString
    poolStats.nftContract = newPair.nft
  }
  poolStats.ethDeposited = plusBigInt(event.transaction.value, poolStats.ethDeposited)
  poolStats.nftsDeposited = plusBigInt(BigInt.fromI32(event.inputs._initialNFTIDs.length), poolStats.nftsDeposited)
  poolStats.save()
  let protocolStats = DailyETHProtocolStat.load(dayString)
  if (!protocolStats) {
    protocolStats = new DailyETHProtocolStat(dayString)
    protocolStats.dayString = dayString
  }
  protocolStats.ethDeposited = plusBigInt(event.transaction.value, protocolStats.ethDeposited)
  protocolStats.nftsDeposited = plusBigInt(BigInt.fromI32(event.inputs._initialNFTIDs.length), protocolStats.nftsDeposited)
  protocolStats.numPairsCreated = plusBigInt(BigInt.fromI32(1), protocolStats.numPairsCreated)
  // protocolStats.numPoolsCreated = plusBigInt(BigInt.fromI32(1), protocolStats.numPoolsCreated)
}

export function handleNewPairEvent(event: NewPairEvent): void {
  LSSVMPairEnumerableETH.create(event.params.poolAddress)
  let pair = Pair.load(event.transaction.hash.toHexString())
  if (!pair) {
    pair = new Pair(event.params.poolAddress.toHexString())
  }
  pair.createdAt = event.block.timestamp
  pair.updatedAt = event.block.timestamp
  pair.createdTx = event.transaction.hash.toHexString()
  pair.owner = event.transaction.from.toHexString()
  pair.initialAttributes = event.transaction.hash.toHexString()
  pair.save()
}

export function handleBondingCurveStatusUpdate(
  event: BondingCurveStatusUpdateEvent
): void {
  let pair = Pair.load(event.address.toHexString())
  if (pair) {
    pair.bondingCurveAddress = event.params.bondingCurve.toHexString()
  }
  let bondingCurveStatusUpdate = new BondingCurveStatusUpdate(event.transaction.hash.toHexString())
  bondingCurveStatusUpdate.save()
}

export function handleNFTDeposit(event: NFTDeposit): void { }

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handleProtocolFeeMultiplierUpdate(
  event: ProtocolFeeMultiplierUpdate
): void { }

export function handleProtocolFeeRecipientUpdate(
  event: ProtocolFeeRecipientUpdate
): void { }

export function handleRouterStatusUpdate(event: RouterStatusUpdate): void { }

export function handleTokenDeposit(event: TokenDeposit): void { }
