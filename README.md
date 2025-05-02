# Bounty Board Optimizer

A Next.js application using MUI to help optimize bounty board refreshes in [Game Name - Placeholder].

## Features

*   Calculates the optimal refresh strategy using **Iterative Dynamic Programming** considering multi-step expected value, based on configurable resource values.
*   Suggests which quests to lock before refreshing (automatically applied if refreshing).
*   **Manually define/redefine individual quest slots.**
*   Visualizes quest details and values.
*   Tracks total value gained since last reset, accounting for refresh costs.
*   Displays refresh value trend chart.
*   Customizable theme.
*   **Built-in export** of the refresh value trend chart (**PNG** format).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    # Navigate into the project directory created by the clone
    cd bb_optimizer 
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

Adjust resource values in the "Resource Value Config" section of the UI. 