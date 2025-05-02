'use client';

import React from 'react';
import { Card, Typography, CardActionArea, Box } from '@mui/material'; 
import LockIcon from '@mui/icons-material/Lock';
// Import ONLY types from bountyData
import { Slot, BountyEntry, ResourceType } from '../lib/bountyData';
import { alpha } from '@mui/material/styles';

interface BountySlotProps {
  slot: Slot;
  onSlotClick: (entryId: string) => void; 
  highlight?: boolean; 
}

// Map rarity ID to full name
const rarityNames: Record<string, string> = {
    L: 'Legendary',
    M: 'Mythic',
    A: 'Ascended', // Corrected name
    default: '' // Handle default case if needed
};

// Rarity colors (use same keys as rarityNames)
const rarityTintColors: Record<string, { bg: string, border: string }> = {
  'L': { bg: alpha('#ff9800', 0.25), border: '#ff9800' }, 
  'M': { bg: alpha('#f44336', 0.25), border: '#f44336' }, 
  'A': { bg: alpha('#ce93d8', 0.30), border: '#ce93d8' }, 
  'default': { bg: alpha('#e4d7c6', 0.70), border: '#a1887f' } 
};

// Define resourceIconPaths LOCALLY again
const resourceIconPaths: Record<ResourceType, string> = {
  Gold: '/icons/gold.png',
  Dust: '/icons/dust.png',
  Stones: '/icons/rareSoulstone.png',
  Diamonds: '/icons/diamond.png',
  Juice: '/icons/juice.png',
  Shards: '/icons/shard.png',
};

const BountySlot: React.FC<BountySlotProps> = ({ slot, onSlotClick, highlight }) => {
  const handleClick = () => {
    onSlotClick(slot.entry.id);
  };

  // Extract rarity prefix from the potentially redefined entry ID
  const rarityPrefix = slot.entry.id.split('.')[0] || 'default'; 
  const colors = rarityTintColors[rarityPrefix] || rarityTintColors['default'];
  const rarityFullName = rarityNames[rarityPrefix] || ''; // Get full name
  // Use local definition of resourceIconPaths
  const iconPath = resourceIconPaths[slot.entry.type] || '/icons/default.png'; // Fallback icon

  return (
    <Card 
      elevation={slot.locked ? 1 : 3} 
      sx={{
        position: 'relative',
        backgroundColor: colors.bg, // Background updates based on prefix
        border: highlight 
          ? '2px solid yellow' 
          : `1px solid ${colors.border}`, // Border updates based on prefix
        borderRadius: '8px',
        opacity: slot.locked ? 0.7 : 1, // Opacity based on lock status only
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
        {/* Always render defined slot content */}
        <>
          {/* Top: Display ONLY Rarity Name */}
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.border, mb: 0.5, height: '1.5em' /* Ensure space even if empty */ }}>
              {rarityFullName}
          </Typography>

          {/* Middle: Icon + Quantity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, my: 0.5 }}>
              <Box component="img" 
                src={iconPath}
                alt={slot.entry.type}
                sx={{
                  width: 24,
                  height: 24,
                  verticalAlign: 'middle'
                }}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {slot.entry.qty.toLocaleString()}
              </Typography>
          </Box>

          {/* Bottom: Resource Type (Moved Here) */}
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
               {slot.entry.type}
          </Typography>
          
          {/* Value */}
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
              Value: {slot.value.toFixed(2)}
          </Typography>
        </>
      </CardActionArea>
      
      {/* Lock icon based on lock status */}
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
