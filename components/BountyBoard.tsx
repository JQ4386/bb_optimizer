'use client';

import React from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import { Slot } from '../lib/bountyData';
import BountySlot from './BountySlot';

interface BountyBoardProps {
  slots: Slot[];
  onSlotClick: (entryId: string) => void;
  onSlotLock: (entryId: string, locked: boolean) => void;
  suggestedLockIds?: string[];
}

const BountyBoard: React.FC<BountyBoardProps> = ({ slots, onSlotClick, onSlotLock, suggestedLockIds = [] }) => {
  return (
    <Box sx={{ flexGrow: 1, my: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {slots.map((slot) => (
          <Box 
            key={slot.entry.id} 
            sx={{
              width: {
                xs: 'calc(25% - 12px)', 
                sm: 'calc(16.666% - 13px)', 
                md: 'calc(12.5% - 14px)' 
              }
            }}
          >
            <BountySlot 
              slot={slot} 
              onSlotClick={onSlotClick} 
              onLockClick={onSlotLock}
              highlight={suggestedLockIds.includes(slot.entry.id)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BountyBoard;
