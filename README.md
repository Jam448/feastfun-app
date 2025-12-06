# FeastFun - Mobile-First PWA Arcade Game

A production-quality Progressive Web App featuring **Feast Frenzy: Solo Sprint**, a fast-paced 60-second arcade game built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

### Core Gameplay
- **Feast Frenzy: Solo Sprint** - 60-second arcade runs with touch/mouse controls
- Touch-optimized player movement (hold to move, tap to dash)
- Multiple object types: Good Bites (+10), Golden Bites (+50), and Hazards
- Combo multiplier system (5 bites = +1 combo level, max 5x)
- Dash mechanic with visual cooldown indicator
- Stun mechanics when hit by hazards

### Progression System
- LocalStorage-based persistence (no backend required)
- Crumbs currency system (earned: floor(score / 200))
- Best score tracking and statistics
- Daily streak counter
- 10 unlockable cosmetics (5 skins, 3 trails, 2 emotes)
- Cosmetics are visual only - no gameplay advantages

### Challenges
- 10 daily challenges (3 active at a time, rotate based on date)
- 5 weekly challenges (reset every Monday)
- Progress tracking with completion rewards
- Challenge-specific crumb bonuses

### UI/UX
- Mobile-first responsive design
- Bottom tab navigation (Home, Play, Challenges, Locker, Settings)
- Full-height game canvas with HUD overlay
- Sound and haptics toggles
- In-app PWA install prompt with iOS/Android instructions
- Settings panel with data reset option

### PWA Features
- Installable on iOS and Android
- Offline-capable with service worker
- Standalone display mode
- Optimized for mobile Safari and Chrome

## Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage
- **Game Engine**: HTML5 Canvas with requestAnimationFrame

## Installation & Development

### Prerequisites
- Node.js 18+ and npm

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will hot-reload as you make changes.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js and deploy

### Option 3: Manual Deployment

1. Run `npm run build` locally
2. Upload the `.next` folder and related files to your hosting
3. Ensure Node.js 18+ is available on the server
4. Run `npm start` on the server

## Project Structure

```
feastfun-pwa/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home screen
│   ├── play/                # Game & results screen
│   ├── challenges/          # Daily/weekly challenges
│   ├── locker/              # Cosmetics shop
│   └── settings/            # Settings & data reset
├── components/              # React components
│   ├── BottomNav.tsx        # Bottom tab navigation
│   ├── GameCanvas.tsx       # Game engine & rendering
│   └── PWAInstallPrompt.tsx # Install instructions
├── hooks/
│   └── useGameStore.ts      # LocalStorage game state
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Game Mechanics

### Player Controls
- **Hold/Drag**: Move player to finger/cursor position
- **Tap**: Trigger dash burst (3-second cooldown)
- **Dash**: Temporarily invulnerable, moves player toward target

### Scoring
- Good Bite (green): +10 × combo
- Golden Bite (yellow): +50 × combo
- Combo increases every 5 consecutive good bites (max 5x)
- Hazard hit: resets combo to 1x and stuns for 0.5s

### Progression
- Crumbs earned: `floor(score / 200)`
- Additional crumbs from completed challenges
- Daily streak increments if at least 1 run per day
- Cosmetics unlock via crumb purchases

## Analytics Events

The game logs the following events to console (can be integrated with analytics):

- `run_started`: Game begins
- `run_ended`: Game ends with score and rewards
- `cosmetic_purchased`: User buys cosmetic
- `challenge_completed`: Challenge finished
- `data_reset`: User resets all progress
- `pwa_installed`: User installs PWA

## Customization

### Add New Cosmetics

Edit `hooks/useGameStore.ts`:

```typescript
export const COSMETICS: Cosmetic[] = [
  {
    id: 'new_skin',
    name: 'New Skin',
    type: 'skin',
    cost: 1000,
    color: '#ff00ff',
    description: 'Custom description'
  },
  // ...
]
```

### Add New Challenges

Edit `hooks/useGameStore.ts`:

```typescript
const CHALLENGE_TEMPLATES = [
  {
    id: 'new_challenge',
    name: 'Challenge Name',
    description: 'Challenge description',
    type: 'daily', // or 'weekly'
    target: 100,
    reward: 200
  },
  // ...
]
```

### Modify Game Parameters

Edit `components/GameCanvas.tsx`:

```typescript
// Game duration (milliseconds)
const GAME_DURATION = 60000

// Spawn rate (milliseconds)
const SPAWN_INTERVAL = 1000

// Dash cooldown (milliseconds)
const DASH_COOLDOWN = 3000

// Object probabilities
const GOLDEN_PROBABILITY = 0.05  // 5%
const HAZARD_PROBABILITY = 0.25  // 25%
```

## Browser Support

- iOS Safari 14+
- Chrome/Edge (mobile & desktop)
- Firefox (mobile & desktop)
- Samsung Internet

## Performance

- First Load JS: ~100 KB (gzipped)
- Static page generation for instant loads
- Optimized canvas rendering (60 FPS target)
- Efficient localStorage usage

## License

MIT

## Credits

Made with ❤️ for mobile arcade fans
