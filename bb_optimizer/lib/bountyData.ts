export type ResourceType = 
  | 'Gold' | 'Dust' | 'Stones' 
  | 'Diamonds' | 'Juice' | 'Shards';

export interface BountyEntry {
  id:   string;        // e.g. "L.Gold"
  type: ResourceType;  // e.g. "Gold"
  qty:  number;        // e.g. 237000
  pct:  number;        // e.g. 0.306818
}

export interface Slot {
  entry: BountyEntry;
  value: number;       // = qty * per-unit value
  locked: boolean;
}

export interface Valuation {
  perUnit:   Record<ResourceType, number>;
  perInvest: Record<ResourceType, number>;
}

// Base investment cost per unit for calculating perInvest from perUnit
// These are example values and should be adjusted based on actual game data
export const investBase: Record<ResourceType, number> = {
  Gold: 10000,     // e.g., 10k gold investment
  Dust: 100,       // e.g., 100 dust investment
  Stones: 1,       // e.g., 1 stone investment
  Diamonds: 10,     // e.g., 10 diamond investment
  Juice: 50,       // e.g., 50 juice investment
  Shards: 1,       // e.g., 1 shard investment
};

// Actual Bounty Data
export const bountyEntries: BountyEntry[] = [
  { id: "L.Gold", type: "Gold", qty: 237000, pct: 0.306818 },
  { id: "M.Gold", type: "Gold", qty: 331000, pct: 0.018182 },
  { id: "A.Gold", type: "Gold", qty: 420000, pct: 0.004545 },
  { id: "L.Dust", type: "Dust", qty: 150, pct: 0.306818 },
  { id: "M.Dust", type: "Dust", qty: 600, pct: 0.054545 },
  { id: "A.Dust", type: "Dust", qty: 900, pct: 0.013636 },
  { id: "L.Stone", type: "Stones", qty: 15, pct: 0.102273 },
  { id: "M.Stone", type: "Stones", qty: 25, pct: 0.018182 },
  { id: "A.Stone", type: "Stones", qty: 40, pct: 0.004545 },
  { id: "L.Dia", type: "Diamonds", qty: 60, pct: 0.102273 },
  { id: "M.Dia", type: "Diamonds", qty: 120, pct: 0.018182 },
  { id: "A.Dia", type: "Diamonds", qty: 240, pct: 0.004545 },
//  { id: "L.Juice", type: "Juice", qty: 0, pct: 0 }, // Ignoring 0 qty/pct entries
  { id: "M.Juice", type: "Juice", qty: 20, pct: 0.018182 },
  { id: "A.Juice", type: "Juice", qty: 30, pct: 0.004545 },
//  { id: "L.Shard", type: "Shards", qty: 0, pct: 0 }, // Ignoring 0 qty/pct entries
  { id: "M.Shard", type: "Shards", qty: 20, pct: 0.018182 },
  { id: "A.Shard", type: "Shards", qty: 30, pct: 0.004545 },
];

// Optional: Verify total percentage if needed
// const totalPct = bountyEntries.reduce((sum, entry) => sum + entry.pct, 0);
// console.log("Total Bounty Percentage:", totalPct); // Should be close to 1.0 or 100%
