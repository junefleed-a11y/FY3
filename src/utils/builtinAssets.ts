// Built-in monochrome & retro vector game sprites (Clean SVG Data URIs)

export interface BuiltinAsset {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultTag: string;
}

function svgToUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const BUILTIN_ASSETS: BuiltinAsset[] = [
  {
    id: 'spaceship',
    name: 'مركبة فضائية (Spaceship)',
    category: 'لاعب (Player)',
    defaultWidth: 50,
    defaultHeight: 50,
    defaultTag: 'player',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
        <polygon points="32,4 12,56 32,46 52,56" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <polygon points="32,16 22,48 32,42 42,48" fill="#000000"/>
        <circle cx="32" cy="28" r="4" fill="#ffffff"/>
      </svg>
    `)
  },
  {
    id: 'ufo_enemy',
    name: 'صحن طائر فضائي (Alien UFO)',
    category: 'أعداء (Enemies)',
    defaultWidth: 50,
    defaultHeight: 35,
    defaultTag: 'enemy',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
        <ellipse cx="32" cy="28" rx="28" ry="12" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <path d="M 20 24 Q 32 6 44 24 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <circle cx="20" cy="28" r="3" fill="#000000"/>
        <circle cx="32" cy="30" r="3" fill="#000000"/>
        <circle cx="44" cy="28" r="3" fill="#000000"/>
      </svg>
    `)
  },
  {
    id: 'player_hero',
    name: 'شخصية بطل (Hero Character)',
    category: 'لاعب (Player)',
    defaultWidth: 40,
    defaultHeight: 56,
    defaultTag: 'player',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64">
        <!-- Head -->
        <circle cx="24" cy="14" r="10" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <!-- Eyes -->
        <circle cx="20" cy="14" r="2" fill="#000000"/>
        <circle cx="28" cy="14" r="2" fill="#000000"/>
        <!-- Body -->
        <rect x="14" y="24" width="20" height="24" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <!-- Belt -->
        <rect x="14" y="34" width="20" height="4" fill="#000000"/>
        <!-- Legs -->
        <rect x="16" y="48" width="6" height="14" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <rect x="26" y="48" width="6" height="14" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      </svg>
    `)
  },
  {
    id: 'coin_star',
    name: 'عملة نجمية (Star Coin)',
    category: 'عناصر (Items)',
    defaultWidth: 32,
    defaultHeight: 32,
    defaultTag: 'coin',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="20" fill="#000000" stroke="#ffffff" stroke-width="3"/>
        <polygon points="24,8 28,18 39,19 31,27 34,38 24,32 14,38 17,27 9,19 20,18" fill="#ffffff"/>
      </svg>
    `)
  },
  {
    id: 'laser_bullet',
    name: 'طلقة ليزر (Laser Bullet)',
    category: 'مقذوفات (Projectiles)',
    defaultWidth: 12,
    defaultHeight: 24,
    defaultTag: 'bullet',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32" width="16" height="32">
        <rect x="4" y="2" width="8" height="28" rx="4" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
        <rect x="6" y="6" width="4" height="20" rx="2" fill="#000000"/>
      </svg>
    `)
  },
  {
    id: 'block_platform',
    name: 'كتلة منصة (Platform Block)',
    category: 'بيئة (Environment)',
    defaultWidth: 120,
    defaultHeight: 28,
    defaultTag: 'platform',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 28" width="120" height="28">
        <rect x="2" y="2" width="116" height="24" rx="3" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <line x1="10" y1="8" x2="110" y2="8" stroke="#000000" stroke-width="2"/>
        <line x1="20" y1="16" x2="100" y2="16" stroke="#000000" stroke-width="2"/>
        <line x1="30" y1="20" x2="90" y2="20" stroke="#000000" stroke-width="1.5"/>
      </svg>
    `)
  },
  {
    id: 'spikes_trap',
    name: 'أشواك خطر (Spikes Trap)',
    category: 'عقبات (Obstacles)',
    defaultWidth: 80,
    defaultHeight: 24,
    defaultTag: 'hazard',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 24" width="80" height="24">
        <polygon points="0,24 10,4 20,24" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
        <polygon points="20,24 30,4 40,24" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
        <polygon points="40,24 50,4 60,24" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
        <polygon points="60,24 70,4 80,24" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
      </svg>
    `)
  },
  {
    id: 'energy_ball',
    name: 'كرة طاقة (Energy Ball)',
    category: 'مقذوفات (Projectiles)',
    defaultWidth: 28,
    defaultHeight: 28,
    defaultTag: 'ball',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <circle cx="16" cy="16" r="8" fill="#000000"/>
        <circle cx="13" cy="13" r="3" fill="#ffffff"/>
      </svg>
    `)
  },
  {
    id: 'trophy_goal',
    name: 'كأس الفوز (Trophy Goal)',
    category: 'عناصر (Items)',
    defaultWidth: 40,
    defaultHeight: 46,
    defaultTag: 'goal',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56" width="48" height="56">
        <path d="M 12 6 L 36 6 L 34 26 Q 32 34 24 34 Q 16 34 14 26 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <path d="M 12 12 Q 4 14 6 22 Q 8 26 14 26" fill="none" stroke="#000000" stroke-width="2"/>
        <path d="M 36 12 Q 44 14 42 22 Q 40 26 34 26" fill="none" stroke="#000000" stroke-width="2"/>
        <rect x="22" y="34" width="4" height="12" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <rect x="14" y="46" width="20" height="6" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      </svg>
    `)
  }
];
