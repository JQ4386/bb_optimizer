// Assume Type definitions (ResourceType, BountyEntry, etc.) are here or imported
// It's best practice to have these defined or imported at the top.

// Example (replace with actual definitions if they are needed here):
export type ResourceType = 'Gold' | 'Dust' | 'Stones' | 'Diamonds' | 'Juice' | 'Shards';

// Define BountyEntry based on usage in other files
export interface BountyEntry {
  id: string;
  type: ResourceType;
  qty: number;
  pct: number; // Assuming 'pct' (percentage/probability) exists based on getRandomBountyEntry
  // Add other potential fields if known
}

// Define Slot based on usage in other files
export interface Slot {
  entry: BountyEntry;
  value: number;
  locked: boolean;
}

// Define Valuation based on usage
export interface Valuation {
  perUnit: Record<ResourceType, number>;
  perInvest: Record<ResourceType, number>;
}

// Existing data structures like investBase, bountyEntries...
export const investBase: Partial<Record<ResourceType, number>> = {
    Gold: 1, Dust: 1, Stones: 1, Diamonds: 1, Juice: 1, Shards: 1
}; // Placeholder
export const bountyEntries: BountyEntry[] = [
    { id: 'L.Gold', type: 'Gold', qty: 100, pct: 1 }, 
    // ... add other actual entries ...
]; // Placeholder

// Resource type list (used in dialog)
const resourceTypes: ResourceType[] = ['Gold', 'Dust', 'Stones', 'Diamonds', 'Juice', 'Shards'];

// Map for custom resource icon paths
const resourceIconPaths: Record<ResourceType, string> = {
  Gold: '/icons/gold.png',
  Dust: '/icons/dust.png',
  Stones: '/icons/stone.png', 
  Diamonds: '/icons/diamonds.png',
  Juice: '/icons/juice.png',
  Shards: '/icons/shards.png',
}; 

// --- Exports --- 
export { 
    ResourceType, 
    BountyEntry, 
    Slot, 
    Valuation 
};
export { 
    investBase, 
    bountyEntries, 
    resourceTypes, 
    resourceIconPaths 
}; 