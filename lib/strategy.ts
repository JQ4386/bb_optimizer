'use client'; // Assuming client-side usage if Math.random is involved implicitly

import { Slot, Valuation, BountyEntry, bountyEntries, ResourceType } from './bountyData';

// --- Helper: Calculate Expected Value of ONE Random Slot ---
function calculateExpectedSlotValue(
  valuation: Valuation,
  isBountifulBountyEnabled: boolean
): number {
  const validEntries = bountyEntries.filter(entry => entry.pct > 0);
  if (validEntries.length === 0) return 0;

  const totalWeight = validEntries.reduce((sum, entry) => sum + entry.pct, 0);
  if (totalWeight === 0) return 0;

  const quantityMultiplier = isBountifulBountyEnabled ? 2 : 1;
  let expectedValue = 0;

  for (const entry of validEntries) {
    const probability = entry.pct / totalWeight;
    const value = entry.qty * quantityMultiplier * (valuation.perUnit[entry.type] || 0);
    expectedValue += probability * value;
  }
  return expectedValue;
}

// --- Helper: Generate Subsets (Power Set) ---
// Input: Array of items
// Output: Array of all subsets of those items
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

// --- Helper: Generate Subsets of a Specific Size (Combinations) ---
// Needed for iterative DP to get all states of size s
function getCombinations<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    function combine(start: number, currentCombo: T[]) {
        if (currentCombo.length === size) {
            result.push([...currentCombo]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            currentCombo.push(arr[i]);
            combine(i + 1, currentCombo);
            currentCombo.pop();
        }
    }
    combine(0, []);
    return result;
}

// --- Helper: Get Canonical Key for Memoization ---
// Input: Set of string IDs
// Output: Sorted, comma-separated string
function getMemoKey(idSet: Set<string>): string {
    return Array.from(idSet).sort().join(',');
}

// --- Main DP Function (Iterative Bottom-Up) ---
export function computeOptimalRefresh(
  initialSlots: Slot[],
  valuation: Valuation,
  isBountifulBountyEnabled: boolean
): {
  recommendedAction: 'Stop' | 'Refresh';
  lockIdsForAction: string[];  // IDs that *should* be locked after taking the action
  immediateNetGain: number;   // Net gain of the first action vs. stopping now
  diamondCost: number;         // Cost of a single refresh (for info)
} {
  const allSlotIds = initialSlots.map(slot => slot.entry.id);
  const N = initialSlots.length;
  const diamondCostValue = 50 * (valuation.perUnit['Diamonds'] || 0);
  const memo = new Map<string, number>();
  const expectedSingleSlotValue = calculateExpectedSlotValue(valuation, isBountifulBountyEnabled);

  // Fill DP table (loop from s=N down to 0)
  for (let s = N; s >= 0; s--) {
    const combinationsOfIds = getCombinations(allSlotIds, s);
    for (const lockedIdArray of combinationsOfIds) {
      const lockedIdsSet = new Set(lockedIdArray);
      const memoKey = getMemoKey(lockedIdsSet);
      if (s === N) {
        memo.set(memoKey, 0);
        continue;
      }
      const unlockedSlots = initialSlots.filter(slot => !lockedIdsSet.has(slot.entry.id));
      let maxGainFromRefreshing = -Infinity;
      const subsetsToPotentiallyLock = getSubsets(unlockedSlots);
      for (const subsetToLock of subsetsToPotentiallyLock) {
        const subsetToLockIds = new Set(subsetToLock.map(sl => sl.entry.id));
        const nextLockedIdsSet = new Set([...lockedIdsSet, ...subsetToLockIds]);
        const nextMemoKey = getMemoKey(nextLockedIdsSet);
        const futureGain = memo.get(nextMemoKey) ?? 0;
        const valueNewlyLocked = subsetToLock.reduce((sum, slot) => sum + slot.value, 0);
        const slotsToBeRefreshed = unlockedSlots.filter(slot => !subsetToLockIds.has(slot.entry.id));
        const numToRefresh = slotsToBeRefreshed.length;
        const currentValueToBeRefreshed = slotsToBeRefreshed.reduce((sum, slot) => sum + slot.value, 0);
        const expectedValueRefreshed = numToRefresh * expectedSingleSlotValue;
        const immediateValueChange = expectedValueRefreshed + valueNewlyLocked - currentValueToBeRefreshed;
        const costThisAction = (numToRefresh > 0) ? diamondCostValue : 0;
        const gainThisAction = immediateValueChange - costThisAction + futureGain;
        maxGainFromRefreshing = Math.max(maxGainFromRefreshing, gainThisAction);
      }
      memo.set(memoKey, Math.max(0, maxGainFromRefreshing));
    }
  }

  // --- Determine the Optimal *First* Action ---
  const initialLockedIdsSet = new Set(
    initialSlots.filter(slot => slot.locked).map(slot => slot.entry.id)
  );
  const initialUnlockedSlots = initialSlots.filter(slot => !slot.locked);

  let bestImmediateGain = 0; // Immediate gain of the best action found so far (relative to stopping)
  let bestTotalGain = 0;     // Total gain (immediate + future) of the best action
  let bestSubsetToLockForFirstRefresh: Slot[] | null = null;

  // --- Special Case: Only 1 Unlocked Slot --- 
  if (initialUnlockedSlots.length === 1) {
      const theOneSlot = initialUnlockedSlots[0];
      const gainFromRefreshingOne = expectedSingleSlotValue - theOneSlot.value - diamondCostValue;
      if (gainFromRefreshingOne > 0) {
          bestImmediateGain = gainFromRefreshingOne; // This IS the immediate gain
          bestTotalGain = gainFromRefreshingOne;     // No future gain possible
          bestSubsetToLockForFirstRefresh = []; 
      }
      // else gains remain 0, default action is Stop
  } else if (initialUnlockedSlots.length > 0) {
      // --- Logic for > 1 Unlocked Slot --- 
      const firstActionSubsets = getSubsets(initialUnlockedSlots);
      for (const subsetToLock of firstActionSubsets) {
          const subsetToLockIds = new Set(subsetToLock.map(s => s.entry.id));
          const nextLockedIdsSet = new Set([...initialLockedIdsSet, ...subsetToLockIds]);
          const nextMemoKey = getMemoKey(nextLockedIdsSet);
          const valueNewlyLocked = subsetToLock.reduce((sum, slot) => sum + slot.value, 0);
          const slotsToBeRefreshed = initialUnlockedSlots.filter(slot => !subsetToLockIds.has(slot.entry.id));
          const numToRefresh = slotsToBeRefreshed.length;
          const currentValueToBeRefreshed = slotsToBeRefreshed.reduce((sum, slot) => sum + slot.value, 0);
          const expectedValueRefreshed = numToRefresh * expectedSingleSlotValue;
          const immediateValueChange = expectedValueRefreshed + valueNewlyLocked - currentValueToBeRefreshed;
          const costThisAction = (numToRefresh > 0) ? diamondCostValue : 0; 
          const immediateGainLoss = immediateValueChange - costThisAction;
          const futureGain = memo.get(nextMemoKey) ?? 0; 
          const totalGainThisAction = immediateGainLoss + futureGain;

          if (totalGainThisAction > bestTotalGain) {
              bestTotalGain = totalGainThisAction;
              bestImmediateGain = immediateGainLoss; // Store immediate gain for this best action
              bestSubsetToLockForFirstRefresh = subsetToLock;
          }
      }
  }

  // --- Construct final results --- 
  let finalBestLockIds = Array.from(initialLockedIdsSet);
  let recommendedAction: 'Stop' | 'Refresh' = 'Stop';
  let additionalLocks: string[] = [];

  // Decide if the best action found involves refreshing
  if (bestSubsetToLockForFirstRefresh && bestTotalGain > 0) {
      recommendedAction = 'Refresh';
      additionalLocks = bestSubsetToLockForFirstRefresh.map(s => s.entry.id);
      finalBestLockIds = Array.from(new Set([...finalBestLockIds, ...additionalLocks]));
  } else {
      // If stopping is best, immediate gain is 0
      bestImmediateGain = 0;
  }
  
  console.log("DP Result (Final Recommendation):", {
      action: recommendedAction,
      additionalLocks: additionalLocks, 
      finalLockIdsForAction: finalBestLockIds,
      immediateNetGain: bestImmediateGain, // Gain of just the first step
      totalExpectedGain: bestTotalGain    // Total gain including future steps
  });

  return {
    recommendedAction: recommendedAction,
    lockIdsForAction: finalBestLockIds.sort(), 
    immediateNetGain: bestImmediateGain, // Return the immediate gain
    diamondCost: diamondCostValue,
  };
}
