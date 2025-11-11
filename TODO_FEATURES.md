# Open World Town - Feature Breakdown

This document provides detailed specifications for each major feature of the Open World Town project.

---

## 1. MainLayout Component

### Components Structure
```
src/presentation/components/layout/
├── MainLayout.tsx          # Main layout wrapper
├── Header.tsx              # Top navigation bar
├── Footer.tsx              # Bottom footer
├── ThemeToggle.tsx         # Theme switcher button
└── MobileMenu.tsx          # Mobile hamburger menu
```

### Header Features
- **Logo:** Open World Town branding
- **Navigation Links:**
  - Home
  - Play
  - Worlds
  - Community
  - About
- **User Actions:**
  - Login button (if not authenticated)
  - User avatar/menu (if authenticated)
  - Theme toggle
- **Responsive:** Hamburger menu on mobile

### Footer Features
- **Links:**
  - About Us
  - Privacy Policy
  - Terms of Service
  - Contact
- **Social Media:**
  - GitHub
  - Discord
  - Twitter/X
- **Credits:**
  - SunnySide UI attribution
  - Framework credits
- **Copyright notice**

### Theme Toggle
- **Modes:** Light, Dark, System
- **Icon:** Sun/Moon/Auto icons (Lucide React)
- **Persistent:** Save preference to localStorage
- **Smooth transition:** Animated theme switching

---

## 2. Landing Page

### Sections

#### 2.1 Hero Section
- **Large heading:** "Build Your Dream Town Together"
- **Subheading:** Short description of the game
- **CTA Buttons:**
  - "Play Now" (primary)
  - "Watch Demo" (secondary)
- **Background:** Animated canvas or static hero image
- **Visual:** Screenshot or animated preview

#### 2.2 Features Section
Display 4-6 key features in a grid:
1. **Top-Down Sandbox**
   - Icon: Map/Grid icon
   - Description: Build and customize your town freely
   
2. **Real-Time Multiplayer**
   - Icon: Users icon
   - Description: Play with friends in real-time via Colyseus
   
3. **Video & Screen Sharing**
   - Icon: Video/Camera icon
   - Description: Communicate via WebRTC using PeerJS
   
4. **Beautiful Pixel Art**
   - Icon: Palette icon
   - Description: Powered by SunnySide UI assets
   
5. **Fully Customizable**
   - Icon: Settings icon
   - Description: Place buildings, decorations, and terrain
   
6. **Cross-Platform**
   - Icon: Monitor icon
   - Description: Play on desktop, tablet, or mobile

#### 2.3 How It Works Section
Step-by-step explanation with visuals:
1. **Create or Join a World**
2. **Customize Your Character**
3. **Build Your Town**
4. **Invite Friends**
5. **Play Together**

#### 2.4 Screenshots/Demo Section
- Carousel of game screenshots
- Video demo (optional)
- Interactive preview (optional)

#### 2.5 Tech Stack Section
Display technologies used:
- Next.js 15
- React Three Fiber
- Colyseus
- PeerJS
- Tailwind CSS
- Zustand
- SunnySide UI

#### 2.6 CTA Section
- Final call-to-action
- "Start Building Your Town Today"
- Sign-up form or "Get Started" button

### Master Data
```typescript
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

interface TechStack {
  id: string;
  name: string;
  description: string;
  logo: string; // URL or icon
  category: 'frontend' | 'backend' | 'database' | 'multiplayer' | 'assets';
}

interface Screenshot {
  id: string;
  url: string;
  alt: string;
  caption: string;
}
```

### Mock Data

```typescript
// src/data/landing-data.ts

export const features: Feature[] = [
  {
    id: 'sandbox',
    title: 'Top-Down Sandbox',
    description: 'Build and customize your town with complete creative freedom. Place buildings, decorations, and design your perfect community.',
    icon: 'Map',
  },
  {
    id: 'multiplayer',
    title: 'Real-Time Multiplayer',
    description: 'Connect with friends instantly via Colyseus. See everyone move in real-time and collaborate on building projects.',
    icon: 'Users',
  },
  {
    id: 'webrtc',
    title: 'Video & Screen Sharing',
    description: 'Communicate face-to-face with integrated video chat and screen sharing powered by PeerJS WebRTC.',
    icon: 'Video',
  },
  {
    id: 'pixel-art',
    title: 'Beautiful Pixel Art',
    description: 'Enjoy charming pixel art graphics from the SunnySide UI asset pack with tiles, sprites, and animations.',
    icon: 'Palette',
  },
  {
    id: 'customizable',
    title: 'Fully Customizable',
    description: 'Place buildings, trees, decorations, and terrain tiles exactly where you want them. Your town, your rules.',
    icon: 'Settings',
  },
  {
    id: 'cross-platform',
    title: 'Cross-Platform',
    description: 'Play seamlessly on desktop, tablet, or mobile devices with responsive controls and adaptive UI.',
    icon: 'Monitor',
  },
];

export const techStack: TechStack[] = [
  {
    id: 'nextjs',
    name: 'Next.js 15',
    description: 'React framework with App Router for optimal SEO and performance',
    logo: '/tech/nextjs.svg',
    category: 'frontend',
  },
  {
    id: 'r3f',
    name: 'React Three Fiber',
    description: '3D rendering engine for the game canvas',
    logo: '/tech/r3f.svg',
    category: 'frontend',
  },
  {
    id: 'colyseus',
    name: 'Colyseus',
    description: 'Multiplayer game server for real-time synchronization',
    logo: '/tech/colyseus.svg',
    category: 'multiplayer',
  },
  {
    id: 'peerjs',
    name: 'PeerJS',
    description: 'WebRTC wrapper for video and screen sharing',
    logo: '/tech/peerjs.svg',
    category: 'multiplayer',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    logo: '/tech/tailwind.svg',
    category: 'frontend',
  },
  {
    id: 'zustand',
    name: 'Zustand',
    description: 'Lightweight state management with persistence',
    logo: '/tech/zustand.svg',
    category: 'frontend',
  },
  {
    id: 'mongodb',
    name: 'MongoDB + Prisma',
    description: 'NoSQL database with type-safe ORM',
    logo: '/tech/mongodb.svg',
    category: 'database',
  },
  {
    id: 'sunnyside',
    name: 'SunnySide UI',
    description: 'Pixel art asset pack for tiles and sprites',
    logo: '/tech/sunnyside.png',
    category: 'assets',
  },
];

export const screenshots: Screenshot[] = [
  {
    id: 'main-town',
    url: '/screenshots/main-town.png',
    alt: 'Main town view with buildings and decorations',
    caption: 'Build Your Dream Town',
  },
  {
    id: 'multiplayer',
    url: '/screenshots/multiplayer.png',
    alt: 'Multiple players in the same world',
    caption: 'Play with Friends',
  },
  {
    id: 'editor',
    url: '/screenshots/editor.png',
    alt: 'In-game map editor interface',
    caption: 'Easy-to-Use Editor',
  },
  {
    id: 'customization',
    url: '/screenshots/customization.png',
    alt: 'Character and world customization',
    caption: 'Customize Everything',
  },
];

export const howItWorks = [
  {
    step: 1,
    title: 'Create or Join a World',
    description: 'Start by creating your own world or join an existing one shared by friends.',
    icon: 'Globe',
  },
  {
    step: 2,
    title: 'Customize Your Character',
    description: 'Pick your avatar, colors, and style to stand out in the community.',
    icon: 'User',
  },
  {
    step: 3,
    title: 'Build Your Town',
    description: 'Place buildings, trees, decorations, and design your perfect town layout.',
    icon: 'Home',
  },
  {
    step: 4,
    title: 'Invite Friends',
    description: 'Share your world link and invite friends to join and collaborate.',
    icon: 'UserPlus',
  },
  {
    step: 5,
    title: 'Play Together',
    description: 'Interact in real-time, chat via video, and enjoy the experience together.',
    icon: 'Users',
  },
];
```

---

## 3. Game Canvas Component

### Core Features
- **Scene Setup:** Camera, lights, skybox
- **Grid Rendering:** Tile-based grid system
- **Player Rendering:** Sprite-based player
- **Input Handling:** Keyboard (WASD/Arrows)
- **Camera Controls:** Follow player, zoom in/out
- **Performance:** Object pooling, LOD

### Component Structure
```
src/presentation/components/game/
├── GameCanvas.tsx          # Main R3F canvas
├── Scene.tsx               # Scene setup (camera, lights)
├── Grid.tsx                # Tile grid renderer
├── Player.tsx              # Player entity
├── Controls.tsx            # Camera and input controls
└── Debug.tsx               # FPS counter, debug info
```

---

## 4. Multiplayer System (Colyseus)

### Server Schema
```typescript
// Colyseus Room Schema
class GameState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
  
  @type('number')
  worldWidth = 100;
  
  @type('number')
  worldHeight = 100;
  
  @type({ map: Building })
  buildings = new MapSchema<Building>();
}

class Player extends Schema {
  @type('string')
  id: string;
  
  @type('number')
  x: number;
  
  @type('number')
  y: number;
  
  @type('string')
  username: string;
  
  @type('string')
  avatar: string;
}

class Building extends Schema {
  @type('string')
  id: string;
  
  @type('number')
  x: number;
  
  @type('number')
  y: number;
  
  @type('string')
  type: string; // 'house', 'tree', 'decoration', etc.
}
```

### Client Integration
- Connect to room
- Send player input
- Listen to state changes
- Interpolate positions
- Handle join/leave events

---

## 5. PeerJS Video System

### Features
- **Video Chat:** Face-to-face communication
- **Screen Sharing:** Share your screen
- **Audio Controls:** Mute/unmute
- **Spatial Audio:** Volume based on distance
- **Video Grid:** Display all participants

### Component Structure
```
src/presentation/components/video/
├── VideoChat.tsx           # Main video chat container
├── VideoGrid.tsx           # Grid of video streams
├── VideoControls.tsx       # Mute, camera toggle
├── ScreenShare.tsx         # Screen sharing UI
└── SpatialAudio.tsx        # Proximity-based volume
```

---

## 6. Map Editor

### Tools
- **Tile Brush:** Paint ground tiles
- **Object Placement:** Place buildings, trees, etc.
- **Eraser:** Remove objects
- **Eyedropper:** Pick existing tile/object
- **Fill Tool:** Fill area with tile
- **Selection Tool:** Select and move objects

### UI Components
```
src/presentation/components/editor/
├── EditorToolbar.tsx       # Tool selection
├── TilePalette.tsx         # Tile selection grid
├── ObjectPalette.tsx       # Objects (buildings, decorations)
├── LayerPanel.tsx          # Layer management
└── EditorCanvas.tsx        # Edit mode canvas
```

### Layers
1. **Ground Layer:** Base terrain tiles
2. **Object Layer:** Buildings, trees
3. **Decoration Layer:** Flowers, rocks, etc.
4. **Collision Layer:** Invisible collision shapes

---

## 7. User Profile System

### Profile Page Features
- **Avatar Display:** Large profile picture
- **Username:** Editable username
- **Bio:** Short description
- **Statistics:**
  - Worlds created
  - Total playtime
  - Buildings placed
  - Friends count
- **World Gallery:** Showcase of created worlds
- **Friend List:** Display and manage friends
- **Settings:** Account settings

### Component Structure
```
src/presentation/components/profile/
├── ProfileHeader.tsx       # Avatar, username, bio
├── ProfileStats.tsx        # User statistics
├── WorldGallery.tsx        # User's worlds
├── FriendList.tsx          # Friend management
└── ProfileSettings.tsx     # Account settings
```

---

## 8. Authentication Flow

### Pages
1. **Login Page:** Email/password or OAuth
2. **Register Page:** Sign up form
3. **Password Reset:** Forgot password flow
4. **Email Verification:** Confirm email

### Protected Routes
- Dashboard
- Profile
- Game (world edit mode)
- Settings

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

---

## 9. World System

### World Features
- **Create World:** Name, description, privacy settings
- **Join World:** Join via link or room code
- **World List:** Browse public worlds
- **World Settings:** Edit name, description, permissions
- **World Sharing:** Generate shareable link

### Database Schema (Prisma)
```prisma
model World {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  ownerId     String   @db.ObjectId
  owner       User     @relation(fields: [ownerId], references: [id])
  isPublic    Boolean  @default(false)
  mapData     Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  username  String   @unique
  avatar    String?
  worlds    World[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 10. Chat System

### Features
- **Text Chat:** Send messages to room
- **Emotes:** Quick reactions
- **Private Messages:** DM other players
- **Chat History:** Scrollable history
- **Notifications:** Message alerts

### Component Structure
```
src/presentation/components/chat/
├── ChatPanel.tsx           # Main chat container
├── ChatInput.tsx           # Message input field
├── ChatMessage.tsx         # Individual message
├── EmoteSelector.tsx       # Emote picker
└── ChatNotification.tsx    # Message notification
```

---

## 11. Settings System

### Settings Categories
1. **Graphics:**
   - Quality (Low, Medium, High)
   - Shadows
   - Particles
   - Resolution
   
2. **Audio:**
   - Master volume
   - Music volume
   - SFX volume
   - Voice chat volume
   
3. **Controls:**
   - Key bindings
   - Mouse sensitivity
   - Touch controls (mobile)
   
4. **Accessibility:**
   - Color blind mode
   - Subtitle size
   - High contrast mode

### Settings Store (Zustand)
```typescript
interface SettingsState {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  accessibility: AccessibilitySettings;
  updateSettings: (category: string, settings: any) => void;
  resetToDefaults: () => void;
}
```

---

## 12. Asset Loading System

### Asset Types
- **Sprites:** Character animations
- **Tiles:** Ground textures
- **Objects:** Buildings, trees, decorations
- **UI:** Icons, buttons, panels
- **Audio:** Music, sound effects

### Asset Loader
```typescript
interface AssetManifest {
  sprites: SpriteAsset[];
  tiles: TileAsset[];
  objects: ObjectAsset[];
  ui: UIAsset[];
  audio: AudioAsset[];
}

class AssetLoader {
  loadManifest(manifest: AssetManifest): Promise<void>;
  getSprite(id: string): Texture;
  getTile(id: string): Texture;
  getObject(id: string): Model;
  getAudio(id: string): AudioBuffer;
}
```

### Loading Screen
- Progress bar
- Asset loading status
- Fun tips/facts
- Animated logo

---

## 13. Mobile Support

### Touch Controls
- **Virtual Joystick:** Movement control
- **Tap to Place:** Place objects with tap
- **Pinch to Zoom:** Camera zoom
- **Two-finger Pan:** Camera pan
- **Context Menu:** Long press for options

### Responsive UI
- Adaptive layouts for small screens
- Bottom sheet for menus
- Floating action buttons
- Swipe gestures

---

## 14. Performance Optimizations

### Client-Side
- Object pooling for entities
- LOD (Level of Detail) for distant objects
- Frustum culling
- Texture atlases
- Lazy loading components

### Server-Side
- Rate limiting
- Message batching
- State compression
- Database indexing
- Caching (Redis)

### Network
- Delta compression
- Interpolation/extrapolation
- Lag compensation
- Connection quality indicator

---

## 15. Analytics & Monitoring

### Events to Track
- User sign-ups
- World creations
- Playtime
- Feature usage
- Error rates
- Network latency

### Tools
- Google Analytics (or Plausible)
- Sentry for error tracking
- Custom analytics dashboard

---

## Implementation Priority

1. ✅ **Phase 1:** MainLayout + Landing Page (Current)
2. **Phase 2:** Authentication + User System
3. **Phase 3:** Basic Game Canvas + Movement
4. **Phase 4:** Tile System + Grid Rendering
5. **Phase 5:** Multiplayer (Colyseus)
6. **Phase 6:** Building Placement
7. **Phase 7:** Map Editor
8. **Phase 8:** Video Chat (PeerJS)
9. **Phase 9:** World Persistence
10. **Phase 10:** Polish + Testing

---

**Note:** Each feature should be developed incrementally with testing at each stage.
