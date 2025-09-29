# OpTrip - Road Trip Optimizer

A web application that optimizes Google Maps travel plans into realistic road trip itineraries based on your preferences.

## Features

- 🗺️ Parse Google Maps shared links
- ⏱️ Customize driving hours per day
- 📅 Set departure and arrival times
- 🏨 Get overnight stop recommendations
- 📊 Visual day-by-day itinerary
- 📤 Export to PDF and calendar

## Getting Started

### Prerequisites

- Node.js 18+
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/r1sh4bh/optrip.git
cd optrip
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Google Maps API key to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Required Google Maps APIs

Enable these APIs in your Google Cloud Console:
- Maps JavaScript API
- Directions API
- Places API
- Geocoding API

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Maps API** - Maps and routing
- **Zustand** - State management
- **React Hook Form** - Form handling

## Project Structure

```
optrip/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── ui/          # Reusable UI components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## License

MIT

## Contributing

Issues and pull requests are welcome!
