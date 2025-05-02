import { Slot, Valuation, BountyEntry, bountyEntries } from './bountyData';

// --- Helper Functions ---

// Weighted random draw function (moved from page.tsx)
const getRandomBountyEntry = (): BountyEntry => {
  // Filter out entries with 0 probability if they exist, to prevent issues
  const validEntries = bountyEntries.filter(entry => entry.pct > 0);
  if (validEntries.length === 0) {
    // Handle edge case where no valid entries exist
    return { id: 'fallback-no-valid', type: 'Gold', qty: 0, pct: 0 }; 
  }

  const totalWeight = validEntries.reduce((sum, entry) => sum + entry.pct, 0);
  // Normalize random number against potentially non-1 total weight
  let random = Math.random() * totalWeight; 

  for (const entry of validEntries) {
    if (random < entry.pct) {
      return entry;
    }
    random -= entry.pct;
  }

  // Fallback in case of rounding errors (should be rare with normalization)
  return validEntries[validEntries.length - 1];
};

// Function to generate all subsets of indices (power set)
function getSubsets<T>(arr: T[]): T[][] {
    const subsets: T[][] = [[]];
    for (const element of arr) {
        const currentLength = subsets.length;
        for (let i = 0; i < currentLength; i++) {
            subsets.push([...subsets[i], element]);
        }
    }
    return subsets;
}

// --- Main Strategy Function ---

export function computeOptimalRefresh(
  currentSlots: Slot[],
  valuation: Valuation,
  maxDepth = 1, 
  mcSamples = 5000
): {
  bestLockIds: string[]; // CHANGED: Return array of slot.entry.id strings
  expectedNetGain: number;   
  diamondCost: number;       
} {
  console.log('computeOptimalRefresh called with:', currentSlots, valuation, mcSamples);

  const diamondCostValue = 50 * (valuation.perUnit['Diamonds'] || 0);
  const currentTotalValue = currentSlots.reduce((sum, slot) => sum + slot.value, 0);

  // Keep track of slots by their unique ID
  const initiallyLockedIds = new Set(
    currentSlots.filter(slot => slot.locked).map(slot => slot.entry.id)
  );
  const unlockedSlots = currentSlots.filter(slot => !slot.locked);

  let bestStrategyNetGain = -Infinity; 
  // Store the IDs of the *additional* unlocked slots to lock for the best strategy
  let additionalIdsToLockForBestStrategy: string[] = []; 

  // If all slots are already locked, no point in refreshing
  if (unlockedSlots.length === 0) {
    console.log("All slots locked, returning no refresh recommendation.");
    return {
      bestLockIds: Array.from(initiallyLockedIds), // Return current locked IDs
      expectedNetGain: 0, 
      diamondCost: diamondCostValue,
    };
  }

  // Iterate through all possible subsets of *unlocked slots* (by ID) to consider locking
  const subsetsOfUnlockedSlots = getSubsets(unlockedSlots);

  console.log(`[Debug] Number of subsets (strategies) to check: ${subsetsOfUnlockedSlots.length}`);
  // console.log(`[Debug] Subsets to check (showing IDs): ${JSON.stringify(subsetsOfUnlockedSlots.map(subset => subset.map(s=>s.entry.id)))}`); // More concise logging
  console.log(`[Debug] Entering simulation loop...`);

  for (const additionalSlotsToLock of subsetsOfUnlockedSlots) {
    const additionalIdsToLock = additionalSlotsToLock.map(s => s.entry.id);
    const finalLockedIdsThisStrategy = new Set([...initiallyLockedIds, ...additionalIdsToLock]);
    const slotsToRefreshThisStrategy = unlockedSlots.filter(slot => !additionalIdsToLock.includes(slot.entry.id));

    // --- MORE DEBUG LOGGING --- 
    const finalLockedIdsArray = Array.from(finalLockedIdsThisStrategy);
    console.log(`[Debug] --- Checking Strategy: Lock IDs [${finalLockedIdsArray.join(',') || 'None'}] ---`);
    // --- END MORE DEBUG LOGGING --- 

    let totalValueSumForStrategy = 0;

    // Run simulations
    for (let i = 0; i < mcSamples; i++) {
      let simulatedBoardValue = 0;

      // Calculate value: sum of initially locked, additionally locked, and refreshed slots
      currentSlots.forEach((originalSlot) => {
        if (finalLockedIdsThisStrategy.has(originalSlot.entry.id)) {
          // Keep value of slots designated to be locked under this strategy
          simulatedBoardValue += originalSlot.value;
        } else {
          // This slot is among those being refreshed (check if it was originally unlocked)
          if (unlockedSlots.some(us => us.entry.id === originalSlot.entry.id)) {
            const newEntry = getRandomBountyEntry();
            simulatedBoardValue += newEntry.qty * (valuation.perUnit[newEntry.type] || 0);
          } else {
            // Should not happen: a slot is neither locked nor unlocked
             console.warn("Slot skipped in simulation logic:", originalSlot.entry.id);
          }
        }
      });
      totalValueSumForStrategy += simulatedBoardValue;
    }

    const averageBoardValueAfterRefresh = totalValueSumForStrategy / mcSamples;
    const expectedNetGainForStrategy = averageBoardValueAfterRefresh - currentTotalValue - diamondCostValue;

    // --- DEBUG LOGGING --- 
    console.log(
      `Strategy (Lock IDs: ${finalLockedIdsArray.join(',') || 'None'}): ` +
      `Avg Future Val=${averageBoardValueAfterRefresh.toFixed(4)}, ` +
      `Current Val=${currentTotalValue.toFixed(4)}, ` +
      `Cost=${diamondCostValue.toFixed(4)}, ` +
      `Net Gain=${expectedNetGainForStrategy.toFixed(4)}`
    );
    // --- END DEBUG LOGGING ---

    if (expectedNetGainForStrategy > bestStrategyNetGain) {
      bestStrategyNetGain = expectedNetGainForStrategy;
      additionalIdsToLockForBestStrategy = additionalIdsToLock; // Store the IDs
    }
  }

  const bestFinalLockIds = Array.from(new Set([...initiallyLockedIds, ...additionalIdsToLockForBestStrategy]));

  console.log("Best strategy found:", { 
      additionalLockIds: additionalIdsToLockForBestStrategy, 
      finalLockIds: bestFinalLockIds,
      netGain: bestStrategyNetGain
  });

  return {
    bestLockIds: bestFinalLockIds.sort(), // Return sorted IDs
    expectedNetGain: bestStrategyNetGain,
    diamondCost: diamondCostValue,
  };
}
