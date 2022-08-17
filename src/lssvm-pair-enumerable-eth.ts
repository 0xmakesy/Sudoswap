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
  DeltaUpdate,
  FeeUpdate,
  NewPair,
  NFTWithdrawal,
  OwnershipTransferred,
  Pair,
  SpotPriceUpdate,
  SwapNFTInPair,
  SwapNFTOutPair,
  TokenDeposit,
  TokenWithdrawal
} from "../generated/schema"
import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";

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
  let pair = Pair.load(event.address.toHexString())
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
  let pair = Pair.load(event.address.toHexString())
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
  let pair = Pair.load(event.address.toHexString())
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
  entity.timestamp = event.block.timestamp
  entity.pair = event.address.toHexString()
  entity.save()
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
  let pair = Pair.load(event.address.toHexString())
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
  let pair = Pair.load(event.address.toHexString())
  if (pair) {
    pair.spotPrice = event.params.newSpotPrice
    pair.updatedAt = event.block.timestamp
    pair.save()
    entity.nft = pair.nft
    // TODO: need to add nft address
  }
  entity.save()
  // update revenue based on swap
}

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {
  let entity = new SwapNFTInPair(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.ethPaidByPool = event.transaction.value // TODO: subtract fee
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  entity.save()
}

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {
  let entity = new SwapNFTOutPair(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.pair = event.address.toHexString()
  entity.ethReceivedByPool = event.transaction.value // TODO: subtract fee
  entity.timestamp = event.block.timestamp
  entity.save()

}

export function handleTokenDeposit(
  event: TokenDepositEvent
): void {
  let entity = new TokenDeposit(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.amount = event.params.amount
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  entity.save()
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let entity = new TokenWithdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.amount = event.params.amount
  entity.pair = event.address.toHexString()
  entity.timestamp = event.block.timestamp
  entity.save()
}
