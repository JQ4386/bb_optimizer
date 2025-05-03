'use client';
import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button, Paper, Divider, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock'; 
import { Valuation, Slot, BountyEntry, ResourceType, bountyEntries, investBase } from '@/lib/bountyData';
import ValuationForm from '@/components/ValuationForm';
import BountyBoard from '@/components/BountyBoard';
import Controls from '@/components/Controls'; 
import { computeOptimalRefresh } from '@/lib/strategy';
import BountyDefinitionDialog from '@/components/BountyDefinitionDialog';

// Define structure for history data point
interface HistoryPoint {
    step: number;
    expectedValue: number; // Expected value *after* a potential refresh
    currentValue: number; // Actual board value *before* refresh decision
}

// ... (interfaces, initialValuation, helpers) ...
interface EvaluationResult {
  recommendedAction?: 'Stop' | 'Refresh'; 
  expectedNetGain: number;   
  diamondCost: number;
} 

const initialValuation: Valuation = {
  perUnit: { 
    Gold: 0,        // Updated
    Dust: 0.25706941, 
    Stones: 0,      // Updated
    Diamonds: 1, 
    Juice: 6,       // Updated
    Shards: 5        // Updated
  },
  // Update perInvest based on new perUnit and imported investBase
  perInvest: { 
    Gold: 0 * (investBase.Gold || 1),               // Updated
    Dust: 0.25706941 * (investBase.Dust || 1), 
    Stones: 0 * (investBase.Stones || 1),           // Updated
    Diamonds: 1 * (investBase.Diamonds || 1), 
    Juice: 6 * (investBase.Juice || 1),             // Updated
    Shards: 5 * (investBase.Shards || 1)             // Updated
  } 
};

// Mapping from full ResourceType to ID abbreviation
const resourceIdMap: Record<ResourceType, string> = {
    Gold: 'Gold',
    Dust: 'Dust',
    Stones: 'Stone', // Abbreviation used in ID
    Diamonds: 'Dia', // Abbreviation used in ID
    Juice: 'Juice',
    Shards: 'Shard' // Abbreviation used in ID
};

const getRandomBountyEntry = (): BountyEntry => {
    const validEntries = bountyEntries.filter(entry => entry.pct > 0);
    if (validEntries.length === 0) return { id: 'fallback-no-valid', type: 'Gold', qty: 0, pct: 0 };
    const totalWeight = validEntries.reduce((sum, entry) => sum + entry.pct, 0);
    let random = Math.random() * totalWeight;
    for (const entry of validEntries) {
        if (random < entry.pct) return entry;
        random -= entry.pct;
    }
    return validEntries[validEntries.length - 1];
};

const sortSlots = (slotsToSort: Slot[]): Slot[] => {
    return [...slotsToSort].sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? -1 : 1));
};

const calculateBoardValue = (slotsToCalc: Slot[], valuationToUse: Valuation): number => {
    return slotsToCalc.reduce((sum, slot) => sum + (slot.value || 0), 0); // Use pre-calculated slot.value
}

export default function Home() {
  // --- State Variables ---
  const [valuation, setValuation] = useState<Valuation>(initialValuation);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hasSub, setHasSub] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [suggestedLockIds, setSuggestedLockIds] = useState<string[]>([]);
  const [evaluationHistory, setEvaluationHistory] = useState<HistoryPoint[]>([]);
  const [isDefinitionDialogOpen, setIsDefinitionDialogOpen] = useState(false);
  const [definingSlotEntryId, setDefiningSlotEntryId] = useState<string | null>(null);
  const [isBountifulBountyEnabled, setIsBountifulBountyEnabled] = useState(false);
  const [initialBoardValueAfterReset, setInitialBoardValueAfterReset] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [needsRecalculationAfterLock, setNeedsRecalculationAfterLock] = useState(false);

  // --- Memos/Callbacks --- 
  const generateInitialSlots = useCallback((count: number, currentValuation: Valuation, bountifulEnabled: boolean): Slot[] => {
    console.log(`Generating initial slots: count=${count}, bountiful=${bountifulEnabled}`);
    const slotsArr: Slot[] = [];
    const quantityMultiplier = bountifulEnabled ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const randomEntry = getRandomBountyEntry(); 
      let uniqueEntryId = `${randomEntry.id}-${Date.now()}-${i}-${Math.random()}`;
      // Calculate final quantity including multiplier
      const finalQty = randomEntry.qty * quantityMultiplier;
      slotsArr.push({
        // Store the potentially doubled quantity
        entry: { ...randomEntry, id: uniqueEntryId, qty: finalQty }, 
        // Calculate value based on the finalQty and perUnit valuation
        value: finalQty * (currentValuation.perUnit[randomEntry.type] || 0),
        locked: false,
      });
    }
    return slotsArr;
  }, []);

  const recalculateSlotValues = useCallback((currentSlots: Slot[]): Slot[] => {
    // Bountiful Bounty state is accessed directly via isBountifulBountyEnabled
    const quantityMultiplier = isBountifulBountyEnabled ? 2 : 1; 
    console.log("Recalculating values based on current bountiful state:", isBountifulBountyEnabled);
    
    // Important: Check if currentSlots actually exists before mapping
    if (!currentSlots) return []; 
    
    return currentSlots.map(slot => {
        // Find the base entry definition to get the original quantity
        const baseEntryId = slot.entry.id.split('-')[0]; // Assumes format like "L.Gold-timestamp-random"
        const baseBountyEntry = bountyEntries.find(entry => entry.id === baseEntryId);
        const baseQty = baseBountyEntry ? baseBountyEntry.qty : slot.entry.qty; // Fallback to current qty if base not found

        // Calculate the quantity based on the *current* bountiful state
        const currentFinalQty = baseQty * quantityMultiplier;
        
        // Calculate the new value based on the potentially updated quantity
        const newValue = currentFinalQty * (valuation.perUnit[slot.entry.type] || 0);
        
        // Return the updated slot with potentially adjusted qty and value
        return {
            ...slot,
            entry: { ...slot.entry, qty: currentFinalQty }, // Update qty in the slot entry
            value: newValue
        };
    });
  }, [valuation, isBountifulBountyEnabled]); // Depend on isBountifulBountyEnabled
  
  // **Define applyAutoLock BEFORE useEffect that depends on it**
  const applyAutoLock = useCallback((idsToLock: string[]) => {
    if (idsToLock.length === 0) return;
    console.log("(Auto) Locking suggested slots:", idsToLock);
    setSlots(currentSlots => 
      currentSlots.map(slot => 
        idsToLock.includes(slot.entry.id) ? { ...slot, locked: true } : slot
      )
    );
  }, []);

  // --- useEffect Hooks ---
  // Recalculate values when valuation or bountiful toggle changes
  useEffect(() => {
    // Pass the current slots state updater function to recalculateSlotValues
    setSlots(recalculateSlotValues); 
    setEvaluationResult(null);
    setSuggestedLockIds([]);
    setEvaluationHistory([]); 
    setNeedsRecalculationAfterLock(false);
  }, [valuation, isBountifulBountyEnabled, recalculateSlotValues]);
  
  // Initialize/reset slots when subscription status changes OR on initial load
  useEffect(() => {
    const numberOfSlots = hasSub ? 9 : 8;
    const newSlots = generateInitialSlots(numberOfSlots, valuation, isBountifulBountyEnabled);
    setSlots(newSlots);
    setInitialBoardValueAfterReset(newSlots.reduce((sum, slot) => sum + slot.value, 0)); 
    setEvaluationResult(null);
    setSuggestedLockIds([]);
    setEvaluationHistory([]); 
    setRefreshCount(0);
    setNeedsRecalculationAfterLock(false);
  }, [hasSub, valuation, isBountifulBountyEnabled, generateInitialSlots]); 

  // **NEW useEffect for Recalculation After Lock**
  useEffect(() => {
    if (!needsRecalculationAfterLock) return;

    console.log("Triggering recalculation after lock update...");
    const boardValueBeforeRecalc = slots.reduce((sum, slot) => sum + slot.value, 0);
    
    // Perform the second calculation using the *updated* slots state
    const result = computeOptimalRefresh(slots, valuation, isBountifulBountyEnabled);
    console.log("Recalculation Result (For Display & History):", result);

    // Update UI display state with the second result
    setEvaluationResult({
        recommendedAction: result.recommendedAction,
        expectedNetGain: result.immediateNetGain, 
        diamondCost: result.diamondCost
    });

    // Update history with the second result
    const expectedValueAfterImmediateAction = boardValueBeforeRecalc + result.immediateNetGain;
    setEvaluationHistory(prevHistory => [
        ...prevHistory,
        { step: prevHistory.length + 1, expectedValue: expectedValueAfterImmediateAction, currentValue: boardValueBeforeRecalc }
    ]);
    
    // Update suggested locks based on the second calculation (might be same or slightly different)
    setSuggestedLockIds(result.lockIdsForAction);
    
    // Reset the flag
    setNeedsRecalculationAfterLock(false);

  // Ensure applyAutoLock is NOT listed as a dependency here, 
  // as that would cause infinite loops. The dependency on `slots` is sufficient.
  }, [slots, needsRecalculationAfterLock, valuation, isBountifulBountyEnabled]); 

  // --- Handlers ---
  const handleValuationChange = (newValuation: Valuation) => {
    setValuation(newValuation);
  };

  // Evaluate: Trigger 1 (Calculate and Apply Locks if needed)
  const handleEvaluate = () => {
    console.log("Evaluate Optimal Refresh Clicked (Trigger 1)");
    
    // Calculate the initial recommendation
    const result = computeOptimalRefresh(slots, valuation, isBountifulBountyEnabled);
    console.log("Initial Evaluation Result (Strategy Output):", result);

    // **DO NOT** update evaluationResult or history here
    // **DO NOT** update suggestedLockIds here (will be updated in useEffect if needed)
    
    // Apply locks ONLY if the recommended action is 'Refresh'
    if (result.recommendedAction === 'Refresh') {
         console.log("Action is Refresh, applying locks:", result.lockIdsForAction);
         // Use the callback version of applyAutoLock directly
         applyAutoLock(result.lockIdsForAction); 
         // Set the flag to trigger recalculation via useEffect
         setNeedsRecalculationAfterLock(true); 
    } else {
        // If stopping is optimal, update the display immediately with 0 gain
        setEvaluationResult({
            recommendedAction: 'Stop',
            expectedNetGain: 0,
            diamondCost: result.diamondCost // Still show cost info
        });
        setSuggestedLockIds(result.lockIdsForAction); // Show initially locked slots
        setNeedsRecalculationAfterLock(false); // Ensure flag is false
    }
  }; 
  
  // Refresh replaces non-locked slots with random entries
   const handleRefresh = () => {
    console.log("Refresh Board Clicked");
    setSlots(currentSlots => {
      const quantityMultiplier = isBountifulBountyEnabled ? 2 : 1;
      const refreshedSlots = currentSlots.map(slot => {
          if (slot.locked) {
              return slot; // Keep locked slots
          } else {
              // Replace non-locked slot with a new random entry
              const randomEntry = getRandomBountyEntry();
              let uniqueEntryId = `${randomEntry.id}-refreshed-${Date.now()}-${Math.random()}`;
              // Calculate final quantity including multiplier
              const finalQty = randomEntry.qty * quantityMultiplier;
              return {
                  // Store the potentially doubled quantity
                  entry: { ...randomEntry, id: uniqueEntryId, qty: finalQty }, 
                  // Calculate value based on finalQty and perUnit valuation
                  value: finalQty * (valuation.perUnit[randomEntry.type] || 0),
                  locked: false
              };
          }
      });
      // Sort slots to bring locked ones to the front visually (optional)
      return sortSlots(refreshedSlots); 
    });
    setEvaluationResult(null); 
    setSuggestedLockIds([]);
    // **Increment Refresh Count**
    setRefreshCount(prev => prev + 1);
  };

  // Reset creates all new random slots
  const handleReset = () => {
    console.log("Reset Board Clicked");
    const numberOfSlots = hasSub ? 9 : 8;
    const initialSlots = generateInitialSlots(numberOfSlots, valuation, isBountifulBountyEnabled);
    setSlots(initialSlots);
    setInitialBoardValueAfterReset(initialSlots.reduce((sum, slot) => sum + slot.value, 0));
    setEvaluationResult(null); 
    setSuggestedLockIds([]);
    setEvaluationHistory([]); 
    // **Reset Refresh Count**
    setRefreshCount(0);
    setNeedsRecalculationAfterLock(false);
  };

  const handleSubscriptionToggle = () => {
    setHasSub(current => !current);
  };

  // Handler for the new toggle
  const handleBountifulBountyToggle = () => {
      setIsBountifulBountyEnabled(current => {
          const newState = !current;
          console.log("Bountiful Bounty Toggled:", newState);
          // TODO: Need to re-calculate slot values and board state when toggled
          // This might involve regenerating slots or recalculating values
          // For now, just toggle the state.
          return newState;
      });
      // Trigger recalculation after state update?
      // Maybe call handleReset() or a dedicated recalculate function?
  };

  // --- Dialog Handlers (Adjusted for Redefine) ---
  const handleOpenRedefineDialog = (entryId: string) => {
      setDefiningSlotEntryId(entryId); // Store entry.id
      setIsDefinitionDialogOpen(true);
  };

  const handleCloseDefinitionDialog = () => {
      setIsDefinitionDialogOpen(false);
      setDefiningSlotEntryId(null);
  };

  // Updated to correctly modify the slot based on the new definition
  const handleConfirmDefinition = (resourceType: ResourceType, rarity: string) => {
    if (!definingSlotEntryId) {
        console.error("Cannot confirm definition: No slot ID defined.");
        handleCloseDefinitionDialog(); // Close dialog even on error
        return;
    }

    // Construct the expected ID prefix (e.g., L.Gold, M.Dust)
    // Use the mapping for IDs (e.g., Stones -> Stone, Diamonds -> Dia)
    const idPrefix = `${rarity}.${resourceIdMap[resourceType]}`;

    // Find the corresponding BountyEntry from the master list
    const targetBountyEntry = bountyEntries.find(entry => entry.id === idPrefix);

    if (!targetBountyEntry) {
        console.error(`Cannot find bounty definition for ID prefix: ${idPrefix}`);
        // Optionally provide feedback to the user here
        handleCloseDefinitionDialog(); // Close dialog if definition not found
        return;
    }
    
    // Apply bountiful multiplier here as well
    const quantityMultiplier = isBountifulBountyEnabled ? 2 : 1;
    console.log(`Redefining slot ${definingSlotEntryId} to ${targetBountyEntry.id} with multiplier ${quantityMultiplier}`);

    setSlots(currentSlots => {
      // No need for multiplier here, it's applied below
      return currentSlots.map(slot => {
          // Find the slot we are redefining
          // **Important**: Match against the *original* ID stored when opening the dialog
          if (slot.entry.id === definingSlotEntryId) { 
            // Calculate final quantity including multiplier
            const finalQty = targetBountyEntry.qty * quantityMultiplier;
            
            // Create a *new* entry object based on the found definition
            const newEntry: BountyEntry = {
                // Use the ID from the master list (e.g., "L.Gold") - NOTE: This ID might change if we append timestamps later
                id: targetBountyEntry.id, 
                type: targetBountyEntry.type, // Use type from master list
                qty: finalQty, // Use potentially doubled qty
                pct: targetBountyEntry.pct // Use pct from master list (though might not be needed here)
            };
            
            // Recalculate value based on the new finalQty and type
            const newValue = finalQty * (valuation.perUnit[newEntry.type] || 0);

            console.log("Updated Slot:", { ...slot, entry: newEntry, value: newValue });
            // Return the updated slot
            // **Important**: Keep other properties like 'locked' status if needed, 
            // but reset lock on manual change? Assuming we reset lock.
            return { ...slot, entry: newEntry, value: newValue, locked: false }; 
          }
          // Return other slots unchanged
          return slot;
      });
    });

    handleCloseDefinitionDialog(); // Close the dialog after successful update
    setNeedsRecalculationAfterLock(false); // Reset eval state after manual change
    setEvaluationResult(null);
    setSuggestedLockIds([]);
  };

  const totalCurrentValue = slots.reduce((sum, slot) => sum + slot.value, 0);
  const totalExtraValue = totalCurrentValue - initialBoardValueAfterReset - (refreshCount * (50 * (valuation.perUnit['Diamonds'] || 0)));

  return (
     <Box sx={{ pt: 2, pb: 4, px: { xs: 1, sm: 2 }, minHeight: '100vh', maxWidth: 1200, mx: 'auto' }}>
       <Typography 
        variant="h4" component="h1" align="center" 
        gutterBottom sx={{ mb: 3, color: 'primary.main' }}
       >
         JD's Bounty Board Optimizer
       </Typography>

       <Box component="section" sx={{ mb: 4 }}>
         <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
           Resource Value Config
         </Typography>
         <ValuationForm 
            valuation={valuation}
            onValuationChange={handleValuationChange}
         />
       </Box>

       <Box component="section" sx={{ mb: 4 }}> 
         <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
           Control Panel
         </Typography>
         <Controls
           onEvaluate={handleEvaluate}
           onReset={handleReset}
           onRefresh={handleRefresh}
           onSubscriptionToggle={handleSubscriptionToggle}
           hasSub={hasSub}
           evaluationResult={evaluationResult}
           evaluationHistory={evaluationHistory}
           isBountifulBountyEnabled={isBountifulBountyEnabled}
           onBountifulBountyToggle={handleBountifulBountyToggle}
           totalExtraValue={totalExtraValue}
         />
       </Box>

       <Stack direction="row" alignItems="center" sx={{ mt: 3, mb: 1 }}> 
             <Typography variant="h6" component="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                 {`Quests - Total Value: ${totalCurrentValue.toFixed(2)}`}
             </Typography>
        </Stack>
       <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 } }}>
          <BountyBoard 
           slots={slots} 
           onSlotClick={handleOpenRedefineDialog} 
           suggestedLockIds={suggestedLockIds}
          />
       </Paper>

       <BountyDefinitionDialog 
         open={isDefinitionDialogOpen}
         onClose={handleCloseDefinitionDialog}
         onConfirm={handleConfirmDefinition}
       />
     </Box>
  );
}
