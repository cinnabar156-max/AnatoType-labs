import { useId } from 'react';
import type { DeckId } from '../types/anatomy';

export type BoneHighlightState = 'idle' | 'target' | 'correct';

interface XRaySVGProps {
  deckId: DeckId;
  activeBoneId?: string;
  highlightState?: BoneHighlightState;
  compact?: boolean;
  className?: string;
}

interface StructureStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  filter?: string;
  opacity: number;
}

const MUSCLE_DECK_IDS: DeckId[] = [
  'head-neck-muscles',
  'upper-muscles',
  'lower-muscles',
];

export function XRaySVG({
  deckId,
  activeBoneId,
  highlightState = 'idle',
  compact = false,
  className = '',
}: XRaySVGProps) {
  const uid = useId().replace(/:/g, '');
  const redGlowId = `red-glow-${uid}`;
  const greenGlowId = `green-glow-${uid}`;
  const boneGradId = `bone-grad-${uid}`;
  const muscleGradId = `muscle-grad-${uid}`;
  const plateGradId = `plate-grad-${uid}`;
  const musclePlateGradId = `muscle-plate-grad-${uid}`;

  const isMuscleDeck = MUSCLE_DECK_IDS.includes(deckId);

  const getStructureStyle = (structureId: string): StructureStyle => {
    const isTarget = activeBoneId === structureId;

    if (!isTarget || highlightState === 'idle') {
      return {
        fill: isMuscleDeck ? `url(#${muscleGradId})` : `url(#${boneGradId})`,
        stroke: isMuscleDeck
          ? compact
            ? 'rgba(226, 178, 190, 0.48)'
            : 'rgba(226, 184, 196, 0.38)'
          : compact
            ? 'rgba(203, 213, 225, 0.55)'
            : 'rgba(226, 232, 240, 0.42)',
        strokeWidth: compact ? 1.15 : 1.3,
        opacity: compact ? 0.9 : 0.86,
      };
    }

    if (highlightState === 'correct') {
      return {
        fill: 'rgba(34, 197, 94, 0.44)',
        stroke: '#22C55E',
        strokeWidth: 2.1,
        filter: `url(#${greenGlowId})`,
        opacity: 1,
      };
    }

    return {
      fill: 'rgba(239, 68, 68, 0.38)',
      stroke: '#EF4444',
      strokeWidth: 2,
      filter: `url(#${redGlowId})`,
      opacity: 1,
    };
  };

  const contextStroke = compact
    ? 'rgba(148, 163, 184, 0.24)'
    : 'rgba(148, 163, 184, 0.22)';
  const contextFill = compact
    ? 'rgba(203, 213, 225, 0.06)'
    : 'rgba(226, 232, 240, 0.05)';

  return (
    <svg
      viewBox="0 0 320 240"
      className={`select-none ${className}`}
      role="img"
      aria-label={`Anatomical diagram for ${deckId}`}
    >
      <defs>
        <radialGradient id={plateGradId} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.07)" />
          <stop offset="65%" stopColor="rgba(15, 23, 42, 0.02)" />
          <stop offset="100%" stopColor="rgba(11, 13, 17, 0)" />
        </radialGradient>

        <radialGradient id={musclePlateGradId} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="rgba(244, 114, 182, 0.06)" />
          <stop offset="65%" stopColor="rgba(15, 23, 42, 0.02)" />
          <stop offset="100%" stopColor="rgba(11, 13, 17, 0)" />
        </radialGradient>

        <linearGradient id={boneGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(241, 245, 249, 0.24)" />
          <stop offset="55%" stopColor="rgba(203, 213, 225, 0.11)" />
          <stop offset="100%" stopColor="rgba(226, 232, 240, 0.20)" />
        </linearGradient>

        <linearGradient id={muscleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(244, 162, 178, 0.22)" />
          <stop offset="55%" stopColor="rgba(180, 120, 138, 0.11)" />
          <stop offset="100%" stopColor="rgba(226, 170, 185, 0.18)" />
        </linearGradient>

        <filter id={redGlowId} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="5"
            floodColor="#EF4444"
            floodOpacity="0.85"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="11"
            floodColor="#EF4444"
            floodOpacity="0.45"
          />
        </filter>

        <filter id={greenGlowId} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="5.5"
            floodColor="#22C55E"
            floodOpacity="0.9"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="12"
            floodColor="#22C55E"
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      {/* Radiographic / Myology exposure field */}
      <rect
        x="0"
        y="0"
        width="320"
        height="240"
        fill={`url(#${isMuscleDeck ? musclePlateGradId : plateGradId})`}
      />

      {/* Calibration ticks */}
      {!compact && (
        <g stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1">
          <path d="M14 22 V14 H22" fill="none" />
          <path d="M298 14 H306 V22" fill="none" />
          <path d="M14 218 V226 H22" fill="none" />
          <path d="M298 226 H306 V218" fill="none" />
        </g>
      )}

      {/* ==================== FOOT & TARSALS ==================== */}
      {deckId === 'foot-tarsals' && (
        <g>
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <path d="M98 104 C95 85 93 64 95 50 C97 44 111 44 113 50 C115 64 114 86 116 102 Z" />
            <path d="M96 42 C95 30 97 19 104 18 C111 18 113 29 112 42 Z" />
            <path d="M123 99 C121 76 121 55 123 41 C124 37 134 37 135 41 C136 56 135 76 136 97 Z" />
            <path d="M123 35 C123 24 125 14 129 14 C133 14 135 24 134 35 Z" />
            <path d="M143 102 C143 79 145 58 147 45 C148 41 157 42 158 46 C159 60 156 80 155 103 Z" />
            <path d="M147 39 C147 29 150 20 154 20 C158 21 158 30 157 39 Z" />
            <path d="M162 110 C165 88 168 68 171 55 C172 51 180 53 181 57 C180 71 176 90 174 112 Z" />
            <path d="M171 49 C172 40 176 32 180 33 C183 34 182 42 180 50 Z" />
            <path d="M180 120 C186 99 191 79 195 67 C196 63 204 65 204 69 C202 84 195 105 194 126 C194 132 188 135 182 130 Z" />
            <path d="M195 61 C197 53 201 46 204 47 C207 48 206 56 203 62 Z" />
          </g>

          <path
            d="M146 154 C161 148 182 154 189 171 C195 187 192 211 176 220 C161 227 142 221 136 207 C131 193 135 164 146 154 Z"
            {...getStructureStyle('calcaneus')}
          />
          <path
            d="M114 148 C116 135 130 131 145 136 C158 141 164 156 158 171 C152 184 134 190 121 182 C110 175 111 160 114 148 Z"
            {...getStructureStyle('talus')}
          />
          <path
            d="M100 130 C105 121 124 119 138 124 C147 127 148 136 140 141 C128 146 109 146 101 140 C97 137 98 133 100 130 Z"
            {...getStructureStyle('navicular')}
          />
          <path
            d="M156 125 C166 118 184 121 190 132 C194 141 189 154 176 155 C164 156 154 149 152 138 C151 132 153 127 156 125 Z"
            {...getStructureStyle('cuboid')}
          />
          <path
            d="M96 107 C102 102 114 103 118 109 C121 115 118 125 109 127 C100 128 93 122 94 114 C94 110 95 108 96 107 Z"
            {...getStructureStyle('medial-cuneiform')}
          />
          <path
            d="M122 102 C128 99 136 100 139 106 C141 112 138 121 131 122 C124 123 119 117 119 110 C119 106 120 103 122 102 Z"
            {...getStructureStyle('intermediate-cuneiform')}
          />
          <path
            d="M142 104 C149 102 157 106 158 114 C159 121 154 128 147 128 C141 128 138 121 139 113 C139 108 140 105 142 104 Z"
            {...getStructureStyle('lateral-cuneiform')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">MEDIAL</text>
              <text x="256" y="34">LATERAL</text>
              <text x="234" y="220">CALCANEAL AXIS</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== HAND & CARPALS ==================== */}
      {deckId === 'hand-carpals' && (
        <g>
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.2">
            <path d="M96 228 L104 185 C106 177 120 174 138 175 C146 176 151 181 151 188 L153 228 Z" />
            <path d="M167 228 L167 187 C167 181 174 176 184 177 C194 178 201 184 202 191 L206 228 Z" />
            <path d="M72 138 C63 123 55 107 52 94 C51 89 61 86 64 91 C70 103 77 119 85 132 C87 137 76 142 72 138 Z" />
            <path d="M51 86 C46 74 43 62 47 59 C52 57 57 67 61 81 Z" />
            <path d="M107 114 C103 87 100 62 99 44 C99 40 109 39 110 44 C112 62 115 87 119 112 Z" />
            <path d="M99 37 C98 25 99 16 104 16 C108 16 110 25 110 37 Z" />
            <path d="M134 109 C133 81 132 56 132 37 C132 33 142 33 143 37 C144 56 145 81 146 109 Z" />
            <path d="M133 30 C133 19 134 11 138 11 C142 11 143 19 143 30 Z" />
            <path d="M160 112 C162 86 164 62 166 44 C166 40 175 41 175 45 C174 63 172 87 171 113 Z" />
            <path d="M166 37 C167 26 169 17 173 17 C176 18 176 27 175 37 Z" />
            <path d="M182 119 C187 96 193 74 197 58 C198 54 206 56 206 60 C203 77 197 99 193 121 Z" />
            <path d="M198 52 C200 42 203 34 207 35 C210 36 208 44 206 53 Z" />
          </g>

          <path
            d="M100 154 C101 142 111 137 120 142 C127 146 128 159 122 167 C116 174 103 173 99 165 C98 161 99 157 100 154 Z"
            {...getStructureStyle('scaphoid')}
          />
          <path
            d="M128 153 C131 145 144 144 152 150 C158 155 157 167 148 171 C138 174 127 169 127 160 C127 157 127 155 128 153 Z"
            {...getStructureStyle('lunate')}
          />
          <path
            d="M159 149 C166 144 179 145 186 153 C191 159 187 170 177 171 C167 172 157 166 157 157 C157 153 158 151 159 149 Z"
            {...getStructureStyle('triquetrum')}
          />
          <path
            d="M179 156 C185 153 194 156 196 163 C197 169 192 175 184 174 C178 173 175 167 176 161 C177 159 178 157 179 156 Z"
            {...getStructureStyle('pisiform')}
          />
          <path
            d="M78 135 C82 126 95 123 103 129 C108 134 107 145 99 149 C90 152 80 148 77 141 C77 139 77 137 78 135 Z"
            {...getStructureStyle('trapezium')}
          />
          <path
            d="M107 122 C113 117 124 117 128 124 C131 130 128 139 120 140 C112 141 105 135 105 128 C105 125 106 123 107 122 Z"
            {...getStructureStyle('trapezoid')}
          />
          <path
            d="M132 117 C137 110 151 110 156 118 C161 126 160 141 151 145 C141 148 131 143 130 132 C129 125 130 120 132 117 Z"
            {...getStructureStyle('capitate')}
          />
          <path
            d="M161 120 C168 114 183 117 188 126 C192 134 188 144 177 145 C166 146 159 139 159 129 C159 125 160 122 161 120 Z"
            {...getStructureStyle('hamate')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">RADIAL (THUMB)</text>
              <text x="234" y="34">ULNAR (PINKY)</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== CRANIUM & SKULL ==================== */}
      {deckId === 'cranium-skull' && (
        <g>
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <path d="M164 190 C176 189 189 192 192 201 C194 208 184 214 171 213 C162 212 158 197 164 190 Z" />
            <path d="M168 216 C181 215 193 219 195 227 C196 233 185 236 173 235 C165 234 162 222 168 216 Z" />
            <ellipse cx="96" cy="112" rx="13" ry="15" />
            <path d="M74 156 L108 158 L108 166 L74 164 Z" />
            <path d="M76 168 L108 170 L107 177 L77 175 Z" />
          </g>

          <path
            d="M84 95 C84 62 104 34 139 27 C146 39 149 58 144 79 C132 88 119 95 107 98 C97 100 88 99 84 95 Z"
            {...getStructureStyle('frontal')}
          />
          <path
            d="M141 27 C178 21 218 35 233 69 C237 80 237 93 233 104 C211 105 186 102 162 96 C151 93 145 86 144 79 C149 58 146 39 141 27 Z"
            {...getStructureStyle('parietal')}
          />
          <path
            d="M233 104 C240 120 236 143 221 159 C209 172 191 178 175 174 C172 162 178 146 190 133 C203 119 218 109 233 104 Z"
            {...getStructureStyle('occipital')}
          />
          <path
            d="M144 102 C158 95 183 98 197 110 C205 117 204 131 193 142 C186 150 183 163 175 166 C167 168 162 158 161 148 C154 142 142 135 132 131 C132 120 137 108 144 102 Z"
            {...getStructureStyle('temporal')}
          />
          <path
            d="M117 97 C127 92 139 91 144 98 C147 105 141 118 132 123 C123 127 114 122 113 112 C112 105 114 100 117 97 Z"
            {...getStructureStyle('sphenoid')}
          />
          <path
            d="M84 100 C92 98 103 101 107 109 C109 116 104 125 95 126 C86 126 80 119 80 111 C80 105 81 101 84 100 Z"
            {...getStructureStyle('ethmoid')}
          />
          <path
            d="M72 131 C78 124 94 123 108 128 C117 132 120 144 114 155 C102 158 84 157 73 153 C69 148 69 136 72 131 Z"
            {...getStructureStyle('maxilla')}
          />
          <path
            d="M75 174 C88 176 107 176 122 169 C133 163 139 147 142 134 C144 129 152 129 153 136 C153 153 148 175 135 186 C120 197 95 198 78 192 C71 189 70 178 75 174 Z"
            {...getStructureStyle('mandible')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">ANTERIOR</text>
              <text x="248" y="34">POSTERIOR</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== UPPER & LOWER LIMB ==================== */}
      {deckId === 'limbs' && (
        <g>
          <line
            x1="160"
            y1="20"
            x2="160"
            y2="220"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <path d="M52 24 C67 22 86 24 94 31 C96 36 86 42 74 42 C63 42 52 33 52 24 Z" />
            <path d="M72 211 L108 211 L112 228 L68 228 Z" />
            <path d="M196 20 C214 18 232 23 236 35 C238 43 224 46 212 43 C200 39 192 28 196 20 Z" />
            <ellipse cx="222" cy="126" rx="7" ry="8" />
            <path d="M208 214 L249 214 L256 228 L206 228 Z" />
          </g>

          <path
            d="M84 36 C91 31 101 35 102 44 C102 52 97 58 97 67 L98 106 C103 111 105 117 100 121 C94 124 85 123 80 119 C76 115 78 109 82 105 L82 65 C79 54 77 41 84 36 Z"
            {...getStructureStyle('humerus')}
          />
          <path
            d="M73 128 C78 125 85 127 86 133 L85 188 C86 196 84 205 76 207 C68 208 65 199 67 190 L70 136 C70 131 71 129 73 128 Z"
            {...getStructureStyle('radius')}
          />
          <path
            d="M93 121 C99 119 105 124 105 132 L103 191 C103 199 100 206 94 206 C89 206 88 198 89 190 L91 135 C90 127 90 122 93 121 Z"
            {...getStructureStyle('ulna')}
          />
          <path
            d="M210 35 C215 31 223 34 224 41 C225 46 222 50 227 52 C234 54 238 61 236 70 L232 108 C236 113 237 120 231 123 C224 126 213 125 208 121 C204 117 206 111 211 107 L214 63 C207 57 203 41 210 35 Z"
            {...getStructureStyle('femur')}
          />
          <path
            d="M207 132 C214 129 224 130 228 135 C231 140 227 147 226 155 L226 196 C227 203 224 210 216 210 C208 210 206 203 207 195 L206 151 C204 142 203 135 207 132 Z"
            {...getStructureStyle('tibia')}
          />
          <path
            d="M235 139 C239 138 244 141 244 146 L245 198 C246 204 244 211 238 211 C234 211 233 204 234 198 L233 148 C232 143 233 140 235 139 Z"
            {...getStructureStyle('fibula')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">UPPER LIMB</text>
              <text x="242" y="34">LOWER LIMB</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== SHOULDER & THORAX ==================== */}
      {deckId === 'shoulder-thorax' && (
        <g>
          {/* Context: vertebral column backdrop & bilateral humeral heads + floating ribs */}
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <rect x="150" y="24" width="20" height="190" rx="5" />
            {/* Left & Right Humeral Heads */}
            <path d="M52 60 C58 53 69 57 70 67 L66 116 L50 116 Z" />
            <path d="M268 60 C262 53 251 57 250 67 L254 116 L270 116 Z" />
            {/* False & Floating Ribs (8-12) */}
            <path d="M148 164 C118 168 95 178 96 190 C97 198 118 202 135 194" fill="none" />
            <path d="M172 164 C202 168 225 178 224 190 C223 198 202 202 185 194" fill="none" />
            <path d="M148 180 C122 185 104 196 106 206 C108 212 124 214 138 206" fill="none" />
            <path d="M172 180 C198 185 216 196 214 206 C212 212 196 214 182 206" fill="none" />
          </g>

          {/* Scapulae (Bilateral Posterior Shoulder Blades) */}
          <g {...getStructureStyle('scapula')}>
            <path d="M74 58 L118 72 L106 128 C102 134 94 134 90 126 L70 72 C68 64 70 59 74 58 Z" />
            <path d="M246 58 L202 72 L214 128 C218 134 226 134 230 126 L250 72 C252 64 250 59 246 58 Z" />
          </g>

          {/* Clavicles (Bilateral S-shaped Collarbones) */}
          <g {...getStructureStyle('clavicle')}>
            <path d="M148 53 C128 48 102 44 74 52 C69 54 68 60 74 61 C100 54 126 57 148 61 Z" />
            <path d="M172 53 C192 48 218 44 246 52 C251 54 252 60 246 61 C220 54 194 57 172 61 Z" />
          </g>

          {/* True Ribs (Pairs 1-7 attaching directly to sternum) */}
          <g {...getStructureStyle('true-ribs')}>
            {/* Left Pairs 1-7 */}
            <path d="M148 68 C122 66 96 74 96 82 C96 88 122 86 148 80 Z" />
            <path d="M148 86 C116 84 86 94 86 103 C86 110 116 106 148 98 Z" />
            <path d="M148 104 C112 103 82 115 82 125 C82 132 114 126 148 117 Z" />
            <path d="M148 123 C112 123 84 136 86 146 C88 153 118 145 148 135 Z" />
            <path d="M148 141 C116 143 90 156 94 166 C97 172 124 163 148 152 Z" />
            {/* Right Pairs 1-7 */}
            <path d="M172 68 C198 66 224 74 224 82 C224 88 198 86 172 80 Z" />
            <path d="M172 86 C204 84 234 94 234 103 C234 110 204 106 172 98 Z" />
            <path d="M172 104 C208 103 238 115 238 125 C238 132 206 126 172 117 Z" />
            <path d="M172 123 C208 123 236 136 234 146 C232 153 202 145 172 135 Z" />
            <path d="M172 141 C204 143 230 156 226 166 C223 172 196 163 172 152 Z" />
          </g>

          {/* Manubrium (Superior Shield of Sternum) */}
          <path
            d="M145 50 C154 54 166 54 175 50 L177 65 L170 84 L150 84 L143 65 Z"
            {...getStructureStyle('manubrium')}
          />

          {/* Sternum Body (Gladiolus) */}
          <path
            d="M151 87 L169 87 L171 154 L166 164 L154 164 L149 154 Z"
            {...getStructureStyle('sternum')}
          />

          {/* Xiphoid Process (Inferior Pointed Tip) */}
          <path
            d="M155 167 L165 167 L162 186 C161 189 159 189 158 186 Z"
            {...getStructureStyle('xiphoid-process')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">THORACIC AP</text>
              <text x="242" y="34">PECTORAL GIRDLE</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== PELVIS & VERTEBRAE ==================== */}
      {deckId === 'pelvis-spine' && (
        <g>
          {/* Context: Skull base at top, rib stubs, and proximal femora at bottom */}
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <path d="M138 14 C146 10 174 10 182 14 C184 22 174 26 160 26 C146 26 136 22 138 14 Z" />
            <path d="M84 196 C92 186 104 188 106 198 L100 228 L78 228 Z" />
            <path d="M236 196 C228 186 216 188 214 198 L220 228 L242 228 Z" />
          </g>

          {/* Cervical Spine (C1-C7) */}
          <g {...getStructureStyle('cervical-spine')}>
            <rect x="148" y="29" width="24" height="7" rx="2" />
            <rect x="147" y="38" width="26" height="7" rx="2" />
            <rect x="147" y="47" width="26" height="7" rx="2" />
            <rect x="146" y="56" width="28" height="7" rx="2" />
          </g>

          {/* Thoracic Spine (T1-T12) */}
          <g {...getStructureStyle('thoracic-spine')}>
            <rect x="145" y="66" width="30" height="8" rx="2" />
            <rect x="144" y="76" width="32" height="8" rx="2" />
            <rect x="144" y="86" width="32" height="8" rx="2" />
            <rect x="143" y="96" width="34" height="8" rx="2" />
            <rect x="143" y="106" width="34" height="8" rx="2" />
          </g>

          {/* Lumbar Spine (L1-L5) */}
          <g {...getStructureStyle('lumbar-spine')}>
            <rect x="141" y="117" width="38" height="9" rx="2.5" />
            <rect x="140" y="128" width="40" height="9" rx="2.5" />
            <rect x="139" y="139" width="42" height="10" rx="2.5" />
            <rect x="139" y="151" width="42" height="10" rx="2.5" />
          </g>

          {/* Ilium (Bilateral Flaring Hip Wings) */}
          <g {...getStructureStyle('ilium')}>
            <path d="M139 162 C116 146 88 152 84 176 C82 188 94 196 112 194 C126 192 135 182 139 170 Z" />
            <path d="M181 162 C204 146 232 152 236 176 C238 188 226 196 208 194 C194 192 185 182 181 170 Z" />
          </g>

          {/* Sacrum (Triangular Wedge) */}
          <path
            d="M140 163 L180 163 L172 198 L160 212 L148 198 Z"
            {...getStructureStyle('sacrum')}
          />

          {/* Ischium (Posteroinferior Sit-bone Loops) */}
          <g {...getStructureStyle('ischium')}>
            <path d="M108 196 C102 204 103 218 113 224 C124 229 140 223 145 210 C134 212 120 206 116 196 Z" />
            <path d="M212 196 C218 204 217 218 207 224 C196 229 180 223 175 210 C186 212 200 206 204 196 Z" />
          </g>

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">VERTEBRAL AXIS</text>
              <text x="242" y="34">PELVIC GIRDLE</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== HEAD & NECK MUSCLES ==================== */}
      {deckId === 'head-neck-muscles' && (
        <g>
          {/* Context lateral head & shoulder outline */}
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.2">
            <path d="M96 92 C94 56 120 24 166 24 C214 24 240 58 236 100 C233 130 212 152 196 164 L208 228 L106 228 L112 184 C98 182 86 174 84 160 C82 146 82 126 86 112 Z" />
            <path d="M188 114 C196 110 202 122 196 134 C192 140 185 138 184 130" fill="none" />
          </g>

          {/* Frontalis (Forehead sheet) */}
          <path
            d="M99 84 C101 60 116 42 138 38 C144 48 144 68 136 84 C122 88 108 88 99 84 Z"
            {...getStructureStyle('frontalis')}
          />

          {/* Orbicularis Oculi (Eye ring) */}
          <path
            d="M94 94 C106 88 122 93 125 103 C128 113 117 122 103 121 C91 120 86 102 94 94 Z"
            {...getStructureStyle('orbicularis-oculi')}
          />

          {/* Temporalis (Fan over lateral cranium) */}
          <path
            d="M142 64 C164 52 194 60 201 84 C204 97 195 110 181 114 C166 116 151 110 143 96 C138 84 138 72 142 64 Z"
            {...getStructureStyle('temporalis')}
          />

          {/* Masseter (Thick jaw chewer) */}
          <path
            d="M132 124 C144 120 158 122 164 128 L160 166 C150 172 136 171 127 163 C125 148 127 134 132 124 Z"
            {...getStructureStyle('masseter')}
          />

          {/* Sternocleidomastoid (Diagonal neck strap from mastoid to sternum/clavicle) */}
          <path
            d="M186 140 C193 139 199 144 196 154 L152 222 C145 225 137 221 139 212 L176 147 C179 142 182 140 186 140 Z"
            {...getStructureStyle('sternocleidomastoid')}
          />

          {/* Platysma (Broad superficial anterior neck sheet) */}
          <path
            d="M108 175 C120 178 136 178 148 174 L134 224 C121 226 107 224 102 216 Z"
            {...getStructureStyle('platysma')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">LATERAL FACIAL</text>
              <text x="232" y="34">CERVICAL MYOLOGY</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== UPPER BODY MUSCLES ==================== */}
      {deckId === 'upper-muscles' && (
        <g>
          <line
            x1="160"
            y1="20"
            x2="160"
            y2="220"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />

          {/* Context Anterior (left) & Posterior (right) Torso + Arm silhouettes */}
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            {/* Anterior silhouette */}
            <path d="M68 38 L104 38 L114 60 L132 72 L126 152 L116 218 L54 218 L46 148 L30 144 L36 74 L56 60 Z" />
            {/* Posterior silhouette */}
            <path d="M216 38 L252 38 L264 60 L284 74 L290 144 L274 148 L266 218 L204 218 L196 152 L188 72 L206 60 Z" />
          </g>

          {/* Trapezius (Posterior upper back diamond/kite) */}
          <path
            d="M226 42 L242 42 L254 70 L274 78 L244 106 L234 134 L224 106 L194 78 L214 70 Z"
            {...getStructureStyle('trapezius')}
          />

          {/* Latissimus Dorsi (Posterior broad lower-back V-fan) */}
          <g {...getStructureStyle('latissimus-dorsi')}>
            <path d="M228 116 L202 104 C198 124 202 156 214 184 L232 184 Z" />
            <path d="M240 116 L266 104 C270 124 266 156 254 184 L236 184 Z" />
          </g>

          {/* Pectoralis Major (Anterior chest fans) */}
          <g {...getStructureStyle('pectoralis-major')}>
            <path d="M84 68 L54 72 C52 88 58 106 72 110 C80 111 84 102 84 90 Z" />
            <path d="M88 68 L118 72 C120 88 114 106 100 110 C92 111 88 102 88 90 Z" />
          </g>

          {/* Deltoid (Shoulder caps on both Anterior and Posterior views) */}
          <g {...getStructureStyle('deltoid')}>
            <path d="M52 64 C40 66 34 80 38 96 C43 102 52 96 54 82 Z" />
            <path d="M120 64 C132 66 138 80 134 96 C129 102 120 96 118 82 Z" />
            <path d="M200 64 C188 66 182 80 186 96 C191 102 200 96 202 82 Z" />
            <path d="M268 64 C280 66 286 80 282 96 C277 102 268 96 266 82 Z" />
          </g>

          {/* Biceps Brachii (Anterior upper arms) */}
          <g {...getStructureStyle('biceps-brachii')}>
            <path d="M38 102 C33 114 33 132 39 142 C45 144 50 130 49 112 Z" />
            <path d="M134 102 C139 114 139 132 133 142 C127 144 122 130 123 112 Z" />
          </g>

          {/* Triceps Brachii (Posterior upper arms) */}
          <g {...getStructureStyle('triceps-brachii')}>
            <path d="M186 102 C180 115 181 134 188 143 C194 144 198 130 197 112 Z" />
            <path d="M282 102 C288 115 287 134 280 143 C274 144 270 130 271 112 Z" />
          </g>

          {/* Rectus Abdominis (Segmented anterior midline core) */}
          <g {...getStructureStyle('rectus-abdominis')}>
            <rect x="72" y="116" width="12" height="16" rx="3" />
            <rect x="88" y="116" width="12" height="16" rx="3" />
            <rect x="72" y="135" width="12" height="16" rx="3" />
            <rect x="88" y="135" width="12" height="16" rx="3" />
            <rect x="73" y="154" width="11" height="18" rx="3" />
            <rect x="88" y="154" width="11" height="18" rx="3" />
          </g>

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">ANTERIOR</text>
              <text x="248" y="34">POSTERIOR</text>
            </g>
          )}
        </g>
      )}

      {/* ==================== LOWER BODY MUSCLES ==================== */}
      {deckId === 'lower-muscles' && (
        <g>
          <line
            x1="160"
            y1="20"
            x2="160"
            y2="220"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />

          {/* Context Anterior (left leg) & Posterior (right leg) silhouettes */}
          <g fill={contextFill} stroke={contextStroke} strokeWidth="1.1">
            <path d="M52 24 L118 24 L114 94 L106 144 L102 214 L74 214 L64 144 L52 94 Z" />
            <path d="M202 24 L268 24 L268 94 L256 144 L246 214 L218 214 L214 144 L206 94 Z" />
          </g>

          {/* Vastus Lateralis (Outer Anterior Thigh) */}
          <path
            d="M60 54 C52 74 53 108 65 130 C71 134 75 118 74 96 C73 74 68 58 60 54 Z"
            {...getStructureStyle('vastus-lateralis')}
          />

          {/* Rectus Femoris (Central Anterior Thigh) */}
          <path
            d="M78 48 C85 48 92 64 91 92 C90 116 86 130 80 130 C74 130 72 110 73 86 C74 64 75 48 78 48 Z"
            {...getStructureStyle('rectus-femoris')}
          />

          {/* Sartorius (Long diagonal strap crossing thigh from outer hip to inner knee) */}
          <path
            d="M58 38 C64 36 72 48 82 74 C92 100 100 124 103 136 C100 140 94 138 90 128 C82 106 72 78 58 48 C55 42 56 39 58 38 Z"
            {...getStructureStyle('sartorius')}
          />

          {/* Tibialis Anterior (Anterior lateral shin) */}
          <path
            d="M69 144 C75 142 82 150 82 174 C82 194 80 206 74 206 C69 206 66 190 66 168 C66 154 67 146 69 144 Z"
            {...getStructureStyle('tibialis-anterior')}
          />

          {/* Gluteus Maximus (Posterior hip powerhouse) */}
          <path
            d="M210 34 C228 28 256 32 264 52 C268 68 256 84 236 84 C218 84 204 72 204 54 C204 42 206 36 210 34 Z"
            {...getStructureStyle('gluteus-maximus')}
          />

          {/* Biceps Femoris (Lateral posterior hamstring) */}
          <path
            d="M244 82 C254 84 260 104 256 126 C252 140 242 142 238 130 C235 116 237 92 244 82 Z"
            {...getStructureStyle('biceps-femoris')}
          />

          {/* Gastrocnemius (Twin-bellied superficial calf) */}
          <path
            d="M218 144 C225 138 235 140 236 154 C237 140 247 138 252 146 C256 160 250 182 236 186 C222 182 214 160 218 144 Z"
            {...getStructureStyle('gastrocnemius')}
          />

          {!compact && (
            <g
              fill="rgba(148, 163, 184, 0.45)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.08em"
            >
              <text x="16" y="34">ANTERIOR</text>
              <text x="248" y="34">POSTERIOR</text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
