'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock'; 
import { Valuation, Slot, BountyEntry, ResourceType, bountyEntries } from '../lib/bountyData'; 
import ValuationForm from '../components/ValuationForm';
import BountyBoard from '../components/BountyBoard';
import Controls from '../components/Controls'; 
import { computeOptimalRefresh } from '../lib/strategy';

// ... (interfaces, initialValuation, helpers) ...
interface EvaluationResult {
  bestLockIds: string[];
  expectedNetGain: number;
  diamondCost: number;
} 

const initialValuation: Valuation = {
  perUnit: { 
    Gold: 0.00007414, Dust: 0.25706941, Stones: 3, Diamonds: 1, Juice: 7.8, Shards: 7.414285714 
  },
  perInvest: { 
    Gold: 0.7414, Dust: 25.706941, Stones: 3, Diamonds: 10, Juice: 390, Shards: 7.414285714
  } 
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

const generateInitialSlots = (count: number, valuation: Valuation): Slot[] => {
  console.log("Generating initial slots with count:", count);
  const slots: Slot[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; i < count; i++) {
    const randomEntry = getRandomBountyEntry();
    let uniqueId = `${randomEntry.id}-${i}`;
    while (usedIds.has(uniqueId)) {
        uniqueId = `${randomEntry.id}-${i}-${Math.random().toString(16).slice(2)}`;
    }
    usedIds.add(uniqueId);
    slots.push({
      entry: { ...randomEntry, id: uniqueId }, 
      value: randomEntry.qty * (valuation.perUnit[randomEntry.type] || 0),
      locked: false,
    });
  }
  return slots;
};


export default function Home() {
  // ... state variables ...
  const [valuation, setValuation] = useState<Valuation>(initialValuation);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hasSub, setHasSub] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [suggestedLockIds, setSuggestedLockIds] = useState<string[]>([]);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(false); // State for the toggle

  // ... useEffect hooks ...
   useEffect(() => {
    setSlots(currentSlots => 
      currentSlots.map(slot => ({
        ...slot,
        value: slot.entry.qty * (valuation.perUnit[slot.entry.type] || 0)
      }))
    );
    setEvaluationResult(null);
    setSuggestedLockIds([]);
  }, [valuation]);
  
  useEffect(() => {
    console.log(`Subscription status changed or initial load: hasSub=${hasSub}`);
    const numberOfSlots = hasSub ? 9 : 8;
    setSlots(generateInitialSlots(numberOfSlots, valuation));
    setEvaluationResult(null);
    setSuggestedLockIds([]);
  }, [hasSub]);

  // ... handleValuationChange, handleToggleLock ...
   const handleValuationChange = (newValuation: Valuation) => {
    setValuation(newValuation);
  };

  const handleToggleLock = (index: number) => {
    setSlots(currentSlots =>
      currentSlots.map((slot, i) =>
        i === index ? { ...slot, locked: !slot.locked } : slot
      )
    );
  };
  
  // Renamed from original handleAutoLock to avoid conflict
  const applyAutoLock = () => {
     if (suggestedLockIds.length === 0) return;
     console.log("(Auto) Locking suggested slots:", suggestedLockIds);
     setSlots(currentSlots => {
        const updatedSlots = currentSlots.map(slot => 
            suggestedLockIds.includes(slot.entry.id) 
            ? { ...slot, locked: true } 
            : slot
        );
        // Don't sort here
        return updatedSlots; 
    });
  };

  // Modified handleEvaluate to potentially trigger auto-lock
  const handleEvaluate = () => {
    console.log("Evaluate Optimal Refresh Clicked");
    const currentSlotsWithValue = slots.map(slot => ({ 
        ...slot, 
        value: slot.entry.qty * (valuation.perUnit[slot.entry.type] || 0) 
    }));
    const result = computeOptimalRefresh(currentSlotsWithValue, valuation);
    console.log("Evaluation Result:", result);
    setEvaluationResult(result);
    setSuggestedLockIds(result.bestLockIds);
    
    // Trigger auto-lock immediately after evaluation if enabled
    if (isAutoLockEnabled && result.bestLockIds.length > 0) {
        // Use a brief timeout to allow state updates to render before locking
        setTimeout(() => applyAutoLock(), 50); 
    }
  }; 
  
  // New handler for the Auto Lock Toggle Switch
  const handleAutoLockToggle = (isEnabled: boolean) => {
      setIsAutoLockEnabled(isEnabled);
      console.log("Auto-Lock Toggle changed:", isEnabled);
  };

  // handleRefresh, handleReset, handleSubscriptionToggle remain the same
   const handleRefresh = () => {
    console.log("Refresh Board Clicked");
    setSlots(currentSlots => {
      const slotsToKeepIndices = new Set(currentSlots.map((s, i) => s.locked ? i : -1).filter(i => i !== -1));
      const numberOfSlotsToRoll = currentSlots.length - slotsToKeepIndices.size;
      if (numberOfSlotsToRoll === 0) {
          console.log("All slots locked, performing full reset instead of refresh.");
          return generateInitialSlots(currentSlots.length, valuation); 
      }
      const newEntries = Array.from({length: numberOfSlotsToRoll}, () => getRandomBountyEntry());
      let newEntryIndex = 0;
      const refreshedSlots = currentSlots.map((slot, index) => {
          if (slotsToKeepIndices.has(index)) {
              return slot; 
          } else {
              const newEntry = newEntries[newEntryIndex++];
              return {
                  entry: { ...newEntry, id: `${newEntry.id}-refreshed-${index}-${Math.random()}` }, 
                  value: newEntry.qty * (valuation.perUnit[newEntry.type] || 0),
                  locked: false
              };
          }
      });
      return sortSlots(refreshedSlots); 
    });
    setEvaluationResult(null); 
    setSuggestedLockIds([]);
  };

  const handleReset = () => {
    console.log("Reset Board Clicked");
    const numberOfSlots = hasSub ? 9 : 8;
    const initialSlots = generateInitialSlots(numberOfSlots, valuation);
    setSlots(initialSlots);
    setEvaluationResult(null); 
    setSuggestedLockIds([]);
  };

  const handleSubscriptionToggle = () => {
    setHasSub(current => !current);
  };

  return (
    <Box sx={{ 
        pt: 2, pb: 4, px: { xs: 1, sm: 2 }, 
        minHeight: '100vh',
        maxWidth: 1200, 
        mx: 'auto' 
      }}
    >
      <Typography 
        variant="h4" component="h1" align="center" 
        gutterBottom sx={{ mb: 3, color: 'primary.main' }}
      >
        BOUNTY BOARD OPTIMIZER
      </Typography>

      {/* Section Title: Resource Value Config - Apply color */}
      <Typography variant="h6" component="h2" sx={{ mb: 1, color: 'primary.main' }}>
          Resource Value Config
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
         <ValuationForm 
          valuation={valuation} 
          onValuationChange={handleValuationChange} 
         />
      </Paper>
         
      {/* Section Title: Control Panel - Apply color */}
      <Typography variant="h6" component="h2" sx={{ mb: 1, color: 'primary.main' }}>
          Control Panel
      </Typography>
      <Controls 
          onEvaluate={handleEvaluate} 
          onReset={handleReset} 
          onRefresh={handleRefresh} 
          onSubscriptionToggle={handleSubscriptionToggle}
          hasSub={hasSub}
          isAutoLockEnabled={isAutoLockEnabled} 
          onAutoLockToggle={handleAutoLockToggle} 
          evaluationResult={evaluationResult}
      />
            
      {/* Section Title: Quests - Apply color */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1, color: 'primary.main' }}>
          Quests
      </Typography>
      <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 } }}>
         <BountyBoard 
          slots={slots} 
          onToggleLock={handleToggleLock} 
          suggestedLockIds={suggestedLockIds}
         />
      </Paper>

    </Box>
  );
}
