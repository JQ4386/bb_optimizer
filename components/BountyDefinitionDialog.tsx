'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Typography,
    Chip,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stack,
    Grid,
    Paper,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ResourceType } from '../lib/bountyData';

// Define resourceTypes LOCALLY
const resourceTypes: ResourceType[] = ['Gold', 'Dust', 'Stones', 'Diamonds', 'Juice', 'Shards'];

// Define resourceIconPaths LOCALLY
const resourceIconPaths: Record<ResourceType, string> = {
  Gold: '/icons/gold.png',
  Dust: '/icons/dust.png',
  Stones: '/icons/rareSoulstone.png',
  Diamonds: '/icons/diamond.png',
  Juice: '/icons/juice.png',
  Shards: '/icons/shard.png',
};

interface BountyDefinitionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (resourceType: ResourceType, rarity: string) => void;
}

const BountyDefinitionDialog: React.FC<BountyDefinitionDialogProps> = ({ open, onClose, onConfirm }) => {
    // Define rarities INSIDE the component
    const rarities = [
        { id: 'L', label: 'Legendary', color: '#ff9800' },
        { id: 'M', label: 'Mythic', color: '#f44336' },
        { id: 'A', label: 'Ascended', color: '#ce93d8' },
    ];

    // Initialize with null to ensure user makes a selection
    const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | null>(null);
    const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedResourceType(null);
            setSelectedRarity(null);
        }
    }, [open]);

    const handleConfirm = () => {
        if (selectedResourceType && selectedRarity) {
            onConfirm(selectedResourceType, selectedRarity);
            onClose(); // Close dialog after confirm
        } else {
            console.error("Cannot confirm: Missing resource or rarity selection.");
        }
    };

    // Handlers for ToggleButtonGroups
    const handleResourceTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newResourceType: ResourceType | null,
    ) => {
        if (newResourceType !== null) { // Prevent de-selection if exclusive
             setSelectedResourceType(newResourceType);
        }
    };

    const handleRarityChange = (
        event: React.MouseEvent<HTMLElement>,
        newRarity: string | null,
    ) => {
        if (newRarity !== null) { // Prevent de-selection if exclusive
            setSelectedRarity(newRarity);
        }
    };

    // Disable confirm if either selection is missing
    const isConfirmDisabled = !selectedResourceType || !selectedRarity;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Redefine Bounty Quest</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Resource Selection - Row of Icons */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Resource Type</Typography>
                        <ToggleButtonGroup
                            value={selectedResourceType}
                            exclusive // Only one can be selected
                            onChange={handleResourceTypeChange}
                            aria-label="resource type"
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} // Allow wrapping
                        >
                            {resourceTypes.map((type) => (
                                <ToggleButton 
                                    key={type} 
                                    value={type} 
                                    aria-label={type}
                                    sx={{
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                        '&.Mui-selected': {
                                            borderColor: 'primary.main',
                                            borderWidth: '2px',
                                            backgroundColor: alpha('#90caf9', 0.2), // Light blue selected highlight
                                        },
                                        '&.Mui-selected:hover': {
                                            backgroundColor: alpha('#90caf9', 0.3),
                                        },
                                        flexGrow: 1, // Make buttons take equal space
                                        minWidth: '50px' // Ensure minimum width
                                    }}
                                >
                                    <Box 
                                        component="img"
                                        src={resourceIconPaths[type]} 
                                        alt={type}
                                        sx={{ width: 24, height: 24 }}
                                    />
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    {/* Rarity Selection - Row of Colored Squares */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Rarity</Typography>
                        <ToggleButtonGroup
                            value={selectedRarity}
                            exclusive // Only one can be selected
                            onChange={handleRarityChange}
                            aria-label="rarity"
                             sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} // Allow wrapping
                        >
                            {rarities.map((rarity) => (
                                <ToggleButton 
                                    key={rarity.id} 
                                    value={rarity.id} 
                                    aria-label={rarity.label}
                                    sx={{
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                        color: '#000', // Ensure text is readable
                                        backgroundColor: alpha(rarity.color, 0.3), // Use rarity color lightly
                                        '&.Mui-selected': {
                                            border: `2px solid ${rarity.color}`,
                                            backgroundColor: alpha(rarity.color, 0.6), // Darker selected background
                                            fontWeight: 'bold',
                                        },
                                        '&.Mui-selected:hover': {
                                            backgroundColor: alpha(rarity.color, 0.7),
                                        },
                                        flexGrow: 1, // Make buttons take equal space
                                        minWidth: '50px' // Ensure minimum width
                                    }}
                                >
                                    {rarity.label} 
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    disabled={isConfirmDisabled}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BountyDefinitionDialog; 