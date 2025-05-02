# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - YYYY-MM-DD

### Added
- Control Panel: Integrated a placeholder area for a future "Refresh Value Trend" line chart.
- Control Panel: Added toggle switch for enabling/disabling subscription (9 vs 8 slots).
- Control Panel: Added toggle switch for auto-locking suggested quests after computation.
- `README.md`: Initial project documentation.
- `CHANGELOG.md`: This changelog file.

### Changed
- Control Panel: Refactored layout using Flexbox to position controls on the left and chart placeholder on the right.
- Control Panel: Adjusted width split between controls and chart placeholder.
- Control Panel: Ensured button text does not wrap (`whiteSpace: 'nowrap'`).
- `BountySlot`: Adjusted layout (vertical) and styling (opacity) based on feedback.
- `BountySlot`: Adjusted background tint opacity for better visibility.
- `BountyBoard`: Updated grid sizing multiple times to accommodate `BountySlot` changes.
- Theme: Updated font to Quicksand across the application.
- Theme: Applied primary color to subsection titles (`page.tsx`).
- Layout: Adjusted maximum width constraints (`page.tsx`) based on feedback.

### Fixed
- Control Panel: Addressed layout issues ensuring chart placeholder appears to the right, not underneath, on smaller screens (using Flexbox).

### Removed
- Previous complex Grid layouts in `Controls.tsx` and `BountyBoard.tsx` that caused persistent linter errors (though errors may still exist). 