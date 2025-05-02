# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - YYYY-MM-DD

### Added
- **Refresh Strategy**: Implemented iterative Dynamic Programming algorithm to calculate optimal multi-step refresh strategy (`lib/strategy.ts`).
- **UI**: Display recommendation based on the *immediate* net gain of the first optimal action (`page.tsx`, `Controls.tsx`).
- **UI**: Added state to track the number of manual refreshes performed (`page.tsx`).
- **UI**: Added custom PNG icons for bounty resources (`public/icons`, `BountySlot.tsx`, `BountyDefinitionDialog.tsx`).
- **UI**: Added Export Chart button (SVG format) to `Controls.tsx`.
- Control Panel: Integrated a placeholder area for a future "Refresh Value Trend" line chart.
- Control Panel: Added toggle switch for enabling/disabling subscription (9 vs 8 slots).
- Control Panel: Added toggle switch for auto-locking suggested quests after computation.
- `README.md`: Initial project documentation.
- `CHANGELOG.md`: This changelog file.
- **Deployment**: Added Firebase configuration (`firebase.json`, `.firebaserc`).

### Changed
- **Refresh Strategy**: Refactored `computeOptimalRefresh` to return immediate action/gain.
- **Evaluation Flow**: Updated `handleEvaluate` to use a two-step process (calculate/lock, then recalculate/display) to ensure UI reflects the state *after* locks are applied.
- **Total Value Calculation**: Corrected `totalExtraValue` calculation to subtract accumulated manual refresh costs (`page.tsx`).
- **Icons**: Updated `BountySlot.tsx` and `BountyDefinitionDialog.tsx` to use correct icon filenames.
- Control Panel: Refactored layout using Flexbox to position controls on the left and chart placeholder on the right.
- Control Panel: Adjusted width split between controls and chart placeholder.
- Control Panel: Ensured button text does not wrap (`whiteSpace: 'nowrap'`).
- **BountyBoard Layout**: Refactored layout from MUI Grid to MUI Box with Flexbox (`components/BountyBoard.tsx`).
- **BountyBoard Layout**: Adjusted Flexbox item widths to fit more items per row (`components/BountyBoard.tsx`).
- `BountySlot`: Adjusted layout (vertical) and styling (opacity) based on feedback.
- `BountySlot`: Adjusted background tint opacity for better visibility.
- `BountyBoard`: Updated grid sizing multiple times to accommodate `BountySlot` changes.
- Theme: Updated font to Quicksand across the application.
- Theme: Applied primary color to subsection titles (`page.tsx`).
- Layout: Adjusted maximum width constraints (`page.tsx`) based on feedback.
- **Build**: Configured Next.js for static export (`next.config.ts`).

### Fixed
- **Build Error**: Bypassed MUI Grid type errors by replacing Grid with Box/Flexbox in `BountyBoard.tsx`.
- **Icons**: Resolved 404 errors for icons by moving `public/icons` to the correct project subdirectory.
- **Evaluation Logic**: Corrected DP gain calculation to only apply refresh cost when slots are actually refreshed.
- **Evaluation Logic**: Corrected handling of the final step when only one slot remains.
- **Locking**: Ensured auto-lock triggers correctly based on the recommended refresh action in `handleEvaluate`.
- Control Panel: Addressed layout issues ensuring chart placeholder appears to the right, not underneath, on smaller screens (using Flexbox).
- **Deployment**: Corrected Firebase Hosting public directory to `out` and removed SPA rewrite (`firebase.json`).

### Removed
- **Deployment**: Removed Netlify configuration files (`netlify.toml`, `.netlify/`).
- Previous complex Grid layouts in `Controls.tsx` and `BountyBoard.tsx` that caused persistent linter errors (though errors may still exist). 
- Single-step Monte Carlo simulation from `lib/strategy.ts`. 