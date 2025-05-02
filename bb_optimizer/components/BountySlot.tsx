'use client';

import React from 'react';
import { Card, Typography, CardActionArea, Box } from '@mui/material'; 
import LockIcon from '@mui/icons-material/Lock';
import { Slot } from '../lib/bountyData';
import { alpha } from '@mui/material/styles';

interface BountySlotProps {
  slot: Slot;
  index: number; 
  onToggleLock: (index: number) => void;
  highlight?: boolean; 
}

// Increase alpha values for background tints
const rarityTintColors: Record<string, { bg: string, border: string }> = {
  'L': { bg: alpha('#ff9800', 0.25), border: '#ff9800' }, // Increased from 0.15
  'M': { bg: alpha('#f44336', 0.25), border: '#f44336' }, // Increased from 0.15
  'A': { bg: alpha('#ce93d8', 0.30), border: '#ce93d8' }, // Increased from 0.20
  'default': { bg: alpha('#e4d7c6', 0.70), border: '#a1887f' } // Increased from 0.60
};

// Resource Icons
const resourceIcons: Record<string, string> = {
  Gold: '💰', Dust: '✨', Stones: '🧱', Diamonds: '💎', Juice: '💧', Shards: '🧩',
};

const BountySlot: React.FC<BountySlotProps> = ({ slot, index, onToggleLock, highlight }) => {
  const handleClick = () => {
    onToggleLock(index);
  };

  const rarityPrefix = slot.entry.id.split('.')[0]; 
  const colors = rarityTintColors[rarityPrefix] || rarityTintColors['default'];

  return (
    <Card 
      elevation={slot.locked ? 1 : 3} 
      sx={{
        position: 'relative',
        backgroundColor: colors.bg, 
        border: highlight 
          ? '2px solid yellow' 
          : `1px solid ${colors.border}`, 
        borderRadius: '8px',
        opacity: slot.locked ? 0.7 : 1, 
        color: 'text.primary', 
        display: 'flex', 
        height: '100%', // Allow grid to control height if needed
      }}
    >
      <CardActionArea 
        onClick={handleClick} 
        sx={{ 
            p: 1.5, // Keep slightly more padding
            flexGrow: 1,
            display: 'flex', 
            flexDirection: 'column', // Back to vertical layout
            alignItems: 'center', // Center items horizontally
            justifyContent: 'center', // Center items vertically
            textAlign: 'center', // Center text
        }}
      >
        {/* Top: Type */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.border, mb: 0.5 }}>
            {`${rarityPrefix !== 'default' ? rarityPrefix+'.' : ''}${slot.entry.type}`}
        </Typography>

        {/* Middle: Icon + Quantity (inline) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, my: 0.5 }}>
            <Typography variant="h5">{resourceIcons[slot.entry.type] || '❓'}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {slot.entry.qty.toLocaleString()}
            </Typography>
        </Box>

        {/* Bottom: Value */}
        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
            Value: {slot.value.toFixed(2)}
        </Typography>

      </CardActionArea>
      
      {/* Lock Icon remains top-right */}
      {slot.locked && (
          <LockIcon 
            sx={{ 
              position: 'absolute', top: 8, right: 8, 
              color: 'error.dark', fontSize: '1.3rem', 
              backgroundColor: alpha("#fff", 0.3), borderRadius: '50%', padding: '1px'
            }} 
          />
        )}
    </Card>
  );
};

export default BountySlot;
