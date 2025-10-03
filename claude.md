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

### Phase 1: Core Setup ✅ COMPLETED
- [x] Initialize Next.js project with TypeScript
- [x] Install required dependencies
- [x] Set up project structure (components, lib, hooks, types)
- [x] Configure environment variables for API keys
- **Status**: Issue #1 closed, committed & pushed

### Phase 2: UI Foundation ✅ COMPLETED
- [x] Create landing page with hero section
- [x] Build input form for Google Maps link
- [x] Add parameter controls (sliders, date pickers)
- [x] Design responsive layout with Tailwind
- [x] Create reusable UI components (Button, Input, Card, Label)
- [x] Build TripForm with validation
- **Status**: Issue #2 closed, committed & pushed

### Phase 3: Google Maps Integration ✅ COMPLETED
- [x] Implement Google Maps link parser
- [x] Extract waypoints from shared links
- [x] Create API routes (expand-url, geocode, parse-link, optimize-route)
- [x] Geocode place names to coordinates
- [x] **Migrated to Google Routes API** (modern REST API instead of legacy Directions API)
- [x] Set up Google Maps JavaScript API for map display
- [x] Create MapDisplay component with polyline rendering
- [x] Display optimized route on interactive map with markers
- **Status**: Issue #3 & #4 completed, Routes API migration successful

### Phase 4: Route Processing ✅ COMPLETED
- [x] Build route optimization algorithm
- [x] Calculate driving segments based on time limits
- [x] Identify optimal stopping points for overnight stays
- [x] Generate day-by-day itinerary with arrival/departure times
- [x] Handle overnight stops and accommodation recommendations
- **Status**: Issue #5 completed

### Phase 5: Results Display ✅ COMPLETED
- [x] Create optimized route visualization on interactive map
- [x] Build itinerary timeline component with day-by-day breakdown
- [x] Add export dropdown menu in itinerary view
- [x] Implement PDF export functionality (print-friendly layout)
- [x] Implement Google Calendar export (.ics file)
- [x] Add share link functionality (URL with encoded trip data)
- **Status**: Issues #6 and #7 completed

### Phase 6: Polish & Deploy ⏳ READY FOR DEPLOYMENT
- [x] Add loading states and error handling
- [x] Implement responsive design (mobile-friendly layouts)
- [x] Add animations and transitions (loading spinners, hover effects)
- [ ] Deploy to Vercel
- [x] Set up GitHub repository
- **Status**: Core app complete, ready for deployment after API key setup

---

## Progress Summary

**✅ FULLY COMPLETED - Core Application Ready!**

All major features implemented:
- ✅ **Phase 1**: Project structure and environment setup
- ✅ **Phase 2**: Landing page and input form UI
- ✅ **Phase 3**: Google Maps link parser + Routes API integration
- ✅ **Phase 4**: Route optimization algorithm with overnight stops
- ✅ **Phase 5**: Interactive map display + Day-by-day itinerary
- ✅ **Phase 6**: Export features (PDF, Calendar, Share)

**⏳ Remaining**
- Add Google Maps API key to `.env.local`
- Deploy to Vercel (optional)

**🎉 The app is fully functional and ready to use!**

**GitHub**: https://github.com/r1sh4bh/optrip

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
│   ├── google-maps.ts       # Routes API utilities & map loading
│   ├── route-optimizer.ts   # Optimization algorithm
│   ├── link-parser.ts       # Parse Google Maps links
│   ├── export-utils.ts      # PDF, Calendar, Share exports
│   └── utils.ts             # Helper functions
├── hooks/
│   └── useGoogleMaps.ts     # Maps hook
├── types/
│   └── index.ts             # TypeScript interfaces
└── styles/
    └── globals.css          # Global styles

```

## API Keys Required
- **Google Routes API** (modern, replaces legacy Directions API)
- **Google Maps JavaScript API** (for map display)
- **Google Geocoding API** (for address lookups)

**Note**: All three APIs use the same API key. Enable them in Google Cloud Console.

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

## 🚀 How to Run

1. **Add your Google Maps API key** to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

5. **Test with a Google Maps link** like:
   - Multi-city trip: https://maps.app.goo.gl/bEoCeuFfneDzMnUi7
   - Any Google Maps directions URL

## ✨ Key Features Implemented

### 1. Intelligent Route Parsing
- Accepts shortened Google Maps links
- Expands and extracts all waypoints
- Geocodes locations to coordinates

### 2. Smart Optimization Algorithm
- Breaks trips into manageable daily segments
- Identifies optimal overnight stops
- Calculates realistic driving times with traffic awareness

### 3. Interactive Visualization
- Live Google Maps integration
- Polyline route rendering
- Markers for all stops

### 4. Detailed Itinerary
- Day-by-day breakdown
- Arrival/departure times
- Overnight stop indicators
- Accommodation recommendations

### 5. Export Options
- **PDF**: Print-friendly itinerary layout
- **Calendar**: .ics file for Google Calendar/iCal
- **Share**: Generate shareable URL with encoded trip data

## Future Enhancements (Optional)
- Store user trips for future reference
- Add user accounts for saving multiple trips
- Include weather data for travel dates
- Add accommodation booking integration
- Support for multiple transportation modes (train, bike)