'use client';

import React, { useRef } from 'react';
import { Box, Button, Switch, FormControlLabel, Typography, Paper, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock'; // Keep for potential future use, but toggle replaces button
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { LineChart } from '@mui/x-charts/LineChart';

// Add HistoryPoint interface (can also be imported if defined centrally)
interface HistoryPoint {
    step: number;
    expectedValue: number; 
    currentValue: number; 
}

interface ControlsProps {
  onEvaluate: () => void;
  onReset: () => void;
  onRefresh: () => void; // Added prop for Refresh button
  onSubscriptionToggle: () => void;
  hasSub: boolean;
  evaluationResult?: { 
    recommendedAction?: 'Stop' | 'Refresh';
    expectedNetGain: number;
    diamondCost: number;
  } | null;
  evaluationHistory: HistoryPoint[]; // Add history prop
  // Disable evaluate/refresh/autolock if needed (e.g., during computation)
  // disabled?: boolean; 
  // Add new props
  isBountifulBountyEnabled: boolean;
  onBountifulBountyToggle: () => void;
  totalExtraValue: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  onEvaluate, 
  onReset, 
  onRefresh, // Destructure new prop
  onSubscriptionToggle,
  hasSub,
  evaluationResult,
  evaluationHistory, // Destructure history prop
  // Destructure new props
  isBountifulBountyEnabled,
  onBountifulBountyToggle,
  totalExtraValue,
  // disabled = false,
}) => {
  // Define gap value for consistent spacing calculation
  const gapValue = 24; // Corresponds to theme.spacing(3)

  const chartRef = useRef<HTMLDivElement>(null);

  // Map history data to plain objects for the chart dataset
  const chartDataset = evaluationHistory.map(point => ({
    step: point.step,
    expectedValue: point.expectedValue,
    currentValue: point.currentValue
  }));

  const handleExport = () => {
    if (!chartRef.current) {
        console.error("Chart container ref not found");
        return;
    }

    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) {
        console.error("SVG element not found within chart container");
        return;
    }

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get dimensions for placing text
    const viewBox = svgClone.viewBox.baseVal;
    const width = viewBox.width || parseFloat(svgClone.getAttribute('width') || '600');
    const height = viewBox.height || parseFloat(svgClone.getAttribute('height') || '250');
    const padding = 10;

    // Create a new text element for the extra value
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", (width / 2).toString()); // Center horizontally
    textElement.setAttribute("y", (height - padding).toString()); // Position near bottom
    textElement.setAttribute("dominant-baseline", "auto");
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("fill", "#555"); // Text color
    textElement.setAttribute("font-size", "10");
    textElement.textContent = `Total Extra Value (Since Reset): ${totalExtraValue.toFixed(2)}`;
    
    // Append the text to the cloned SVG
    svgClone.appendChild(textElement);

    // Adjust viewbox height slightly if needed to ensure text fits
    svgClone.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${width} ${height + padding}`);

    // Serialize the modified SVG
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bounty-chart-export.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={onEvaluate} 
                  sx={{ whiteSpace: 'nowrap' }}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Compute Optimal
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={onRefresh} 
                  startIcon={<RefreshIcon />} 
                  title="Refresh Unlocked Slots (Cost: 50 Diamonds)"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Refresh
                </Button>
              </Box>
              
              {/* Right side toggles/reset + Export */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={hasSub} onChange={onSubscriptionToggle} />}
                  label={hasSub ? "Sub (9 Slots)" : "No Sub (8 Slots)"}
                  title="Toggle between 8 and 9 quest slots"
                  sx={{ mr: { sm: 1 }, whiteSpace: 'nowrap' }}
                />
                <FormControlLabel
                  control={<Switch checked={isBountifulBountyEnabled} onChange={onBountifulBountyToggle} />}
                  label="Bountiful (+100%)"
                  title="Apply Bountiful Bounty bonus (Doubles Quantities)"
                  sx={{ whiteSpace: 'nowrap' }} 
                />
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={onReset} 
                  size="small" 
                  sx={{ whiteSpace: 'nowrap' }}
                  startIcon={<RestartAltIcon />}
                >
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
                  Expected Net Gain from Refresh Action: {evaluationResult.expectedNetGain.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Diamond Cost (Value): {evaluationResult.diamondCost.toFixed(2)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={(evaluationResult.recommendedAction === 'Refresh' && evaluationResult.expectedNetGain > 0) ? 'success.main' : 'error.main'} 
                  sx={{ fontWeight: 'bold' }}
                >
                  Recommendation: {(evaluationResult.recommendedAction === 'Refresh' && evaluationResult.expectedNetGain > 0) 
                                    ? 'Refresh Recommended' 
                                    : 'Do Not Refresh (Stop)'}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Click "Compute Optimal" to see recommendations.
              </Typography>
            )}
          </Box>
           {/* Display Total Extra Value */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                Total Extra Value (Since Reset): {totalExtraValue.toFixed(2)}
            </Typography>
        </Box>

        {/* Right Column: Chart Placeholder Area (Flex Item) - Narrower */} 
        {/* Adjust flexBasis for 4/12 split, subtracting half the gap */}
        <Box sx={{ 
            position: 'relative', // Needed for absolute positioning of children
            flexBasis: { xs: '100%', md: `calc(100% * 4 / 12 - ${gapValue / 2}px)`},
            display: 'flex', 
            flexDirection: 'column', 
            flexGrow: 1, 
            minHeight: 250 
        }}> 
          {/* Export Button Overlay */} 
           <IconButton 
              aria-label="Export Chart"
              onClick={handleExport}
              disabled={chartDataset.length === 0}
              size="small"
              sx={{
                  position: 'absolute',
                  top: 8, // Adjust as needed
                  right: 8, // Adjust as needed
                  zIndex: 1 // Ensure it's above chart elements if necessary
              }}
              title="Export Chart as SVG"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', flexShrink: 0, pr: 5 /* Add padding to avoid overlap */ }}>
            Refresh Value Trend
          </Typography>
          {/* Actual Line Chart */}
          <Box ref={chartRef} sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
            {chartDataset.length > 0 ? (
              <LineChart
                dataset={chartDataset}
                xAxis={[{ 
                    dataKey: 'step', 
                    label: 'Step', 
                    scaleType: 'linear',
                    valueFormatter: (value: number) => value.toString()
                }]}
                series={[
                  {
                    dataKey: 'expectedValue',
                    label: 'Expected (Post-Refresh)',
                    color: '#9c27b0', // Purple
                    valueFormatter: (value: number | null) => value?.toFixed(0) ?? '' // Format as integer
                  },
                  {
                    dataKey: 'currentValue',
                    label: 'Actual (Pre-Refresh)',
                    color: '#2e7d32', // Green
                    valueFormatter: (value: number | null) => value?.toFixed(0) ?? '' // Format as integer
                  },
                ]}
                margin={{ top: 10, right: 10, bottom: 20, left: 40 }} // Adjusted left margin for values
                // Optionally add grid, tooltip, legend customization here
              />
            ) : (
               <Box 
                    sx={{ 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    bgcolor: 'action.hover',
                    flexGrow: 1, 
                    minHeight: 150, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                    }} 
                >
                    <Typography variant="caption" color="text.secondary">No evaluation data yet.</Typography>
                </Box>
            )}
          </Box>
        </Box>

      </Box>
    </Paper>
  );
};

export default Controls;
