// USPS Ground Advantage retail rates from Seattle (Zone 6 reference), rounded up
const WEIGHT_TIERS: Array<{ maxLbs: number; cost: number }> = [
  { maxLbs: 1,  cost: 11 },
  { maxLbs: 2,  cost: 13 },
  { maxLbs: 3,  cost: 15 },
  { maxLbs: 5,  cost: 18 },
  { maxLbs: 10, cost: 24 },
]
const OVER_10_LBS_COST = 32

export function shippingCostForWeight(weightLbs: number): number {
  for (const tier of WEIGHT_TIERS) {
    if (weightLbs <= tier.maxLbs) return tier.cost
  }
  return OVER_10_LBS_COST
}
