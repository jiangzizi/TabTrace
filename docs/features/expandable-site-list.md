# Expandable Site List Feature

## Overview
Added expandable "Show All" functionality to the Top Sites section, allowing users to view all tracked websites instead of just the top 5.

## Changes Made

### 1. popup.js
- Added `isExpanded` state variable to track expand/collapse state
- Added `TOP_SITES_COUNT` constant (set to 5)
- Modified `updateSitesList()` to display all sites when expanded
- Added `updateExpandButton()` to update button visibility and text
- Added `toggleExpand()` function to handle expand/collapse
- Added event listener binding for expand button in DOMContentLoaded

### 2. popup.html
- Added expand button with id="expandBtn" below sites list
- Button includes text span and chevron icon
- Uses aria-expanded for accessibility

### 3. popup.css
- Added `.expand-btn` styles with dashed border and hover effects
- Added `.expand-icon` with rotation animation when expanded
- Added `.sites-list.expanded` class for increased max-height (400px)
- Modified `.sites-list` to have max-height: 200px (default)
- Added custom scrollbar styling for webkit browsers

## UI Layout Changes

### Site Item Layout
Reorganized site item structure:
- Left: Rank number + favicon icon
- Center: Domain name (flexible width, ellipsis overflow)
- Right: Time duration + progress bar (vertical stack)

This layout ensures:
- Domain names have maximum space
- Time and progress bar are always visible
- No text overlap or truncation issues

## Behavior
- Default: Shows top 5 sites by time spent
- Button shows "Show All (N)" when more than 5 sites exist
- Clicking expands to show all sites with scrollable list
- Button changes to "Show Less" when expanded
- Smooth height transition via CSS

## Accessibility
- Uses `aria-expanded` attribute on button
- Keyboard accessible via click event listener
- Maintains focus states and visual feedback
