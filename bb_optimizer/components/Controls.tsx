'use client';

import React from 'react';
import { Box, Button, Switch, FormControlLabel, Typography, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock'; // Keep for potential future use, but toggle replaces button

interface ControlsProps {
  onEvaluate: () => void;
  onReset: () => void;
  onRefresh: () => void; // Added prop for Refresh button
  onSubscriptionToggle: () => void;
  isAutoLockEnabled: boolean; // Added prop for Auto Lock toggle state
  onAutoLockToggle: (isEnabled: boolean) => void; // Added prop for handling toggle change
  hasSub: boolean;
  evaluationResult?: { 
    expectedNetGain: number;
    diamondCost: number;
  } | null;
  // Disable evaluate/refresh/autolock if needed (e.g., during computation)
  // disabled?: boolean; 
}

const Controls: React.FC<ControlsProps> = ({ 
  onEvaluate, 
  onReset, 
  onRefresh, // Destructure new prop
  onSubscriptionToggle,
  isAutoLockEnabled, // Destructure new props
  onAutoLockToggle, 
  hasSub,
  evaluationResult,
  // disabled = false,
}) => {
  const handleAutoLockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAutoLockToggle(event.target.checked);
  };

  // Define gap value for consistent spacing calculation
  const gapValue = 24; // Corresponds to theme.spacing(3)

  return (
    // Single Paper containing everything
    <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 2 }}>
      {/* Use Flexbox for side-by-side layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: `${gapValue}px` }}> 

        {/* Left Column: Controls Area (Flex Item) - Wider */}
        {/* Adjust flexBasis for 8/12 split, subtracting half the gap */}
        <Box sx={{ flexBasis: { xs: '100%', md: `calc(100% * 8 / 12 - ${gapValue / 2}px)`}, flexGrow: 1 }}> 
          {/* Group buttons and toggles */}
          <Box mb={2}>
            {/* Top row: Main Actions */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Left side buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="secondary" onClick={onEvaluate} sx={{ whiteSpace: 'nowrap' }} /* disabled={disabled} */>
                  Compute Optimal
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={onRefresh} 
                  startIcon={<RefreshIcon />} 
                  title="Refresh Unlocked Slots (Cost: 50 Diamonds)"
                  sx={{ whiteSpace: 'nowrap' }}
                  /* disabled={disabled} */
                >
                  Refresh
                </Button>
              </Box>
              
              {/* Right side toggles/reset */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                 <FormControlLabel
                  control={<Switch checked={isAutoLockEnabled} onChange={handleAutoLockChange} /* disabled={disabled} */ />}
                  label="Auto-Lock Suggested"
                  title="Automatically lock suggested quests after computing"
                  sx={{ whiteSpace: 'nowrap' }} // Also prevent label wrap if needed
                />
                <FormControlLabel
                  control={<Switch checked={hasSub} onChange={onSubscriptionToggle} />}
                  label={hasSub ? "Sub (9 Slots)" : "No Sub (8 Slots)"}
                  sx={{ mr: { sm: 1 }, whiteSpace: 'nowrap' }} 
                />
                <Button variant="outlined" color="secondary" onClick={onReset} size="small" sx={{ whiteSpace: 'nowrap' }}>
                  Reset Board
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Result display area */}
          <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, minHeight: '6em', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {evaluationResult ? (
              <>
                <Typography variant="body2">
                  Expected Net Gain from Refresh: {evaluationResult.expectedNetGain.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Diamond Cost (Value): {evaluationResult.diamondCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color={evaluationResult.expectedNetGain > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                  Recommendation: {evaluationResult.expectedNetGain > 0 ? 'Refresh Recommended' : 'Do Not Refresh'}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Click "Compute Optimal" to see recommendations.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right Column: Chart Placeholder Area (Flex Item) - Narrower */} 
        {/* Adjust flexBasis for 4/12 split, subtracting half the gap */}
        <Box sx={{ flexBasis: { xs: '100%', md: `calc(100% * 4 / 12 - ${gapValue / 2}px)`}, display: 'flex', flexDirection: 'column', flexGrow: 1 }}> 
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Refresh Value Trend
          </Typography>
          {/* Placeholder SVG Area */}
          <Box 
            component="svg" 
            width="100%" 
            sx={{ 
              border: '1px dashed', 
              borderColor: 'divider', 
              borderRadius: 1, 
              bgcolor: 'action.hover',
              flexGrow: 1, // Allow it to take available vertical space
              minHeight: 150, // Ensure a minimum height
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }} 
          >
             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontSize="14">
                Chart Placeholder
            </text>
          </Box>
        </Box>

      </Box>
    </Paper>
  );
};

export default Controls;
