'use client';

import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Slot } from '../lib/bountyData';
import BountySlot from './BountySlot';

interface BountyBoardProps {
  slots: Slot[];
  onSlotClick: (entryId: string) => void;
  suggestedLockIds?: string[];
}

const BountyBoard: React.FC<BountyBoardProps> = ({ slots, onSlotClick, suggestedLockIds = [] }) => {
  return (
    <Box sx={{ flexGrow: 1, my: 2 }}>
      <Grid container spacing={2}>
        {slots.map((slot) => (
          <Grid item xs={6} sm={4} md={3} key={slot.entry.id}>
            <BountySlot 
              slot={slot} 
              onSlotClick={onSlotClick} 
              highlight={suggestedLockIds.includes(slot.entry.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BountyBoard;
