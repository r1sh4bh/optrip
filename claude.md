# OpTrip - Road Trip Optimizer Web App

## Project Overview
A web application that takes Google Maps travel plan links and optimizes them into realistic road trip itineraries based on user preferences like driving hours per day, departure/arrival constraints, and rest stop preferences.

## Tech Stack
- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Maps Integration**: Google Maps JavaScript API
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Core Features

### 1. Input & Parsing
- Accept Google Maps link (e.g., https://maps.app.goo.gl/bEoCeuFfneDzMnUi7)
- Parse the link to extract waypoints and route information
- Display the original route on an embedded map

### 2. Trip Parameters
- **Driving Limits**: Max hours per day (e.g., 8 hours)
- **Time Constraints**:
  - Departure date/time from origin
  - Arrival deadline at destination
- **Rest Preferences**: Preferred stop duration
- **Route Options**: Avoid highways/tolls

### 3. Route Optimization Algorithm
- Break down total journey into manageable daily segments
- Identify optimal stopping points for overnight stays
- Consider:
  - Daily driving hour limits
  - Natural break points (cities/towns)
  - Hotel/accommodation availability zones
  - Rest stop recommendations

### 4. Output & Visualization
- Interactive map showing optimized route with stops
- Day-by-day itinerary breakdown
- Each day shows:
  - Start/end locations
  - Driving time and distance
  - Recommended departure/arrival times
  - Suggested overnight stops
- Export options (PDF, Google Calendar, share link)

## Implementation Plan

### Phase 1: Core Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Install required dependencies
- [ ] Set up project structure
- [ ] Configure environment variables for API keys

### Phase 2: UI Foundation
- [ ] Create landing page with hero section
- [ ] Build input form for Google Maps link
- [ ] Add parameter controls (sliders, date pickers)
- [ ] Design responsive layout with Tailwind

### Phase 3: Google Maps Integration
- [ ] Set up Google Maps JavaScript API
- [ ] Create map component for route display
- [ ] Implement Google Maps link parser
- [ ] Extract waypoints from shared links
- [ ] Display original route on map

### Phase 4: Route Processing
- [ ] Build route optimization algorithm
- [ ] Calculate driving segments based on time limits
- [ ] Identify optimal stopping points
- [ ] Generate day-by-day itinerary

### Phase 5: Results Display
- [ ] Create optimized route visualization
- [ ] Build itinerary timeline component
- [ ] Add interactive features (modify stops)
- [ ] Implement export functionality

### Phase 6: Polish & Deploy
- [ ] Add loading states and error handling
- [ ] Implement responsive design
- [ ] Add animations and transitions
- [ ] Deploy to Vercel
- [ ] Set up GitHub repository

## Project Structure
```
optrip/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── plan/
│   │   └── page.tsx         # Route planning page
│   └── api/
│       ├── parse-link/      # Parse Google Maps link
│       └── optimize-route/  # Route optimization logic
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Slider.tsx
│   ├── MapDisplay.tsx       # Google Maps component
│   ├── TripForm.tsx         # Input form
│   ├── ItineraryView.tsx    # Results display
│   └── RouteTimeline.tsx    # Day-by-day timeline
├── lib/
│   ├── google-maps.ts       # Maps API utilities
│   ├── route-optimizer.ts   # Optimization algorithm
│   ├── link-parser.ts       # Parse Google Maps links
│   └── utils.ts             # Helper functions
├── hooks/
│   ├── useGoogleMaps.ts     # Maps hook
│   └── useTripStore.ts      # Zustand store
├── types/
│   └── index.ts             # TypeScript interfaces
└── styles/
    └── globals.css          # Global styles

```

## API Keys Required
- Google Maps JavaScript API
- Google Directions API
- Google Places API

## Algorithm Details

### Route Optimization Logic
1. **Parse Input**: Extract all waypoints from Google Maps link
2. **Calculate Total**: Get total distance and time via Directions API
3. **Daily Segmentation**:
   ```
   - For each day:
     - Start from current position
     - Calculate maximum distance (max_hours * avg_speed)
     - Find suitable stopping point near that distance
     - Consider city/town availability
     - Add buffer time for rest/meals
   ```
4. **Stop Selection**:
   - Prioritize cities/towns over highway exits
   - Consider amenities (hotels, restaurants)
   - Adjust based on user preferences
5. **Time Calculation**:
   - Factor in departure time preferences
   - Add rest stops every 2-3 hours
   - Include meal breaks
   - Buffer for traffic/delays

## UI/UX Design Principles
- **Clean & Modern**: Minimalist design with focus on usability
- **Visual Hierarchy**: Clear distinction between input/output
- **Responsive**: Works on desktop, tablet, and mobile
- **Interactive**: Real-time updates as parameters change
- **Feedback**: Loading states, error messages, success indicators

## Color Scheme
- Primary: Blue (#3B82F6) - Trust, journey
- Secondary: Green (#10B981) - Go, success
- Accent: Orange (#F59E0B) - Waypoints, stops
- Background: White/Gray gradients
- Text: Dark gray (#1F2937)

## Next Steps
1. Finalize the plan and get approval
2. Set up Google Cloud project and obtain API keys
3. Start implementing Phase 2 (UI Foundation)
4. Build incrementally with testing at each phase

## Questions to Consider
- Should we store user trips for future reference?
- Add user accounts for saving multiple trips?
- Include weather data for travel dates?
- Add accommodation booking integration?
- Support for multiple transportation modes?