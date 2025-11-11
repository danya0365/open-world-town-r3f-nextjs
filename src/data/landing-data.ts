/**
 * Landing Page Master Data
 * Contains all static data for the landing page
 */

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface TechStack {
  id: string;
  name: string;
  description: string;
  category: "frontend" | "backend" | "database" | "multiplayer" | "assets";
}

export interface Screenshot {
  id: string;
  url: string;
  alt: string;
  caption: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

// Features
export const features: Feature[] = [
  {
    id: "sandbox",
    title: "Top-Down Sandbox",
    description:
      "Build and customize your town with complete creative freedom. Place buildings, decorations, and design your perfect community.",
    icon: "Map",
  },
  {
    id: "multiplayer",
    title: "Real-Time Multiplayer",
    description:
      "Connect with friends instantly via Colyseus. See everyone move in real-time and collaborate on building projects.",
    icon: "Users",
  },
  {
    id: "webrtc",
    title: "Video & Screen Sharing",
    description:
      "Communicate face-to-face with integrated video chat and screen sharing powered by PeerJS WebRTC.",
    icon: "Video",
  },
  {
    id: "pixel-art",
    title: "Beautiful Pixel Art",
    description:
      "Enjoy charming pixel art graphics from the SunnySide UI asset pack with tiles, sprites, and animations.",
    icon: "Palette",
  },
  {
    id: "customizable",
    title: "Fully Customizable",
    description:
      "Place buildings, trees, decorations, and terrain tiles exactly where you want them. Your town, your rules.",
    icon: "Settings",
  },
  {
    id: "cross-platform",
    title: "Cross-Platform",
    description:
      "Play seamlessly on desktop, tablet, or mobile devices with responsive controls and adaptive UI.",
    icon: "Monitor",
  },
];

// Tech Stack
export const techStack: TechStack[] = [
  {
    id: "nextjs",
    name: "Next.js 15",
    description: "React framework with App Router for optimal SEO and performance",
    category: "frontend",
  },
  {
    id: "r3f",
    name: "React Three Fiber",
    description: "3D rendering engine for the game canvas",
    category: "frontend",
  },
  {
    id: "colyseus",
    name: "Colyseus",
    description: "Multiplayer game server for real-time synchronization",
    category: "multiplayer",
  },
  {
    id: "peerjs",
    name: "PeerJS",
    description: "WebRTC wrapper for video and screen sharing",
    category: "multiplayer",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS v4",
    description: "Utility-first CSS framework for rapid UI development",
    category: "frontend",
  },
  {
    id: "zustand",
    name: "Zustand",
    description: "Lightweight state management with persistence",
    category: "frontend",
  },
  {
    id: "mongodb",
    name: "MongoDB + Prisma",
    description: "NoSQL database with type-safe ORM",
    category: "database",
  },
  {
    id: "sunnyside",
    name: "SunnySide UI",
    description: "Pixel art asset pack for tiles and sprites",
    category: "assets",
  },
];

// Screenshots (Mock - replace with actual screenshots later)
export const screenshots: Screenshot[] = [
  {
    id: "main-town",
    url: "/screenshots/main-town.png",
    alt: "Main town view with buildings and decorations",
    caption: "Build Your Dream Town",
  },
  {
    id: "multiplayer",
    url: "/screenshots/multiplayer.png",
    alt: "Multiple players in the same world",
    caption: "Play with Friends",
  },
  {
    id: "editor",
    url: "/screenshots/editor.png",
    alt: "In-game map editor interface",
    caption: "Easy-to-Use Editor",
  },
  {
    id: "customization",
    url: "/screenshots/customization.png",
    alt: "Character and world customization",
    caption: "Customize Everything",
  },
];

// How It Works
export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Create or Join a World",
    description: "Start by creating your own world or join an existing one shared by friends.",
    icon: "Globe",
  },
  {
    step: 2,
    title: "Customize Your Character",
    description: "Pick your avatar, colors, and style to stand out in the community.",
    icon: "User",
  },
  {
    step: 3,
    title: "Build Your Town",
    description: "Place buildings, trees, decorations, and design your perfect town layout.",
    icon: "Home",
  },
  {
    step: 4,
    title: "Invite Friends",
    description: "Share your world link and invite friends to join and collaborate.",
    icon: "UserPlus",
  },
  {
    step: 5,
    title: "Play Together",
    description: "Interact in real-time, chat via video, and enjoy the experience together.",
    icon: "Users",
  },
];
