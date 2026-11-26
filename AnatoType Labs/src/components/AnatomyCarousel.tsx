import { CheckCircle2, Crosshair } from 'lucide-react';
import type { BoneItem, DeckId } from '../types/anatomy';
import { XRaySVG, type BoneHighlightState } from './XRaySVG';

interface AnatomyCarouselProps {
  deckId: DeckId;
  bones: BoneItem[];
  activeIndex: number;
  isCompletedFlash: boolean;
}

export function AnatomyCarousel({
  deckId,
  bones,
  activeIndex,
  isCompletedFlash,
}: AnatomyCarouselProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-[270px] sm:h-[320px] flex items-center justify-center overflow-hidden select-none">
      {bones.map((bone, idx) => {
        const offset = idx - activeIndex;
        // Render only nearby cards for smooth sliding window (prev, active, next + entering/exiting)
        if (Math.abs(offset) > 2) {
          return null;
        }

        const isActive = offset === 0;
        const isPrev = offset === -1;
        const isNext = offset === 1;

        let highlightState: BoneHighlightState = 'idle';
        if (isActive) {
          highlightState = isCompletedFlash ? 'correct' : 'target';
        } else if (offset < 0) {
          highlightState = 'correct';
        }

        // Smooth compositor-only transforms for 3-card horizontal carousel
        let translateX = '0%';
        let scale = 1;
        let opacity = 1;
        let filter = 'none';
        let zIndex = 20;

        if (isPrev) {
          translateX = '-78%';
          scale = 0.7;
          opacity = 0.34;
          filter = 'brightness(0.75) saturate(0.85)';
          zIndex = 10;
        } else if (isNext) {
          translateX = '78%';
          scale = 0.7;
          opacity = 0.34;
          filter = 'brightness(0.75) saturate(0.85)';
          zIndex = 10;
        } else if (offset <= -2) {
          translateX = '-145%';
          scale = 0.55;
          opacity = 0;
          filter = 'brightness(0.6)';
          zIndex = 0;
        } else if (offset >= 2) {
          translateX = '145%';
          scale = 0.55;
          opacity = 0;
          filter = 'brightness(0.6)';
          zIndex = 0;
        }

        return (
          <div
            key={bone.id}
            aria-hidden={!isActive}
            className="absolute w-[290px] sm:w-[390px] h-[250px] sm:h-[300px] rounded-xl bg-[#181B22] border border-[#2A2F3A] flex flex-col justify-between p-3 sm:p-4 transition-[transform,opacity,filter] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            style={{
              transform: `translateX(${translateX}) scale(${scale})`,
              opacity,
              filter,
              zIndex,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {/* Top radiographic frame status */}
            <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
              <span className="text-slate-400">
                PLATE {String(idx + 1).padStart(2, '0')}
              </span>

              {isActive && !isCompletedFlash && (
                <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
                  <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Target Highlighted</span>
                </span>
              )}

              {((isActive && isCompletedFlash) || offset < 0) && (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{bone.name}</span>
                </span>
              )}

              {offset > 0 && (
                <span className="text-slate-500">Queued</span>
              )}
            </div>

            {/* X-Ray Diagram */}
            <div className="flex-1 my-2 rounded-lg bg-[#0B0D11] border border-[#2A2F3A]/80 flex items-center justify-center overflow-hidden p-1.5">
              <XRaySVG
                deckId={deckId}
                activeBoneId={bone.id}
                highlightState={highlightState}
                compact={!isActive}
                className="w-full h-full max-h-[210px]"
              />
            </div>

            {/* Bottom anatomical landmark clue (never reveals bone name before completion) */}
            <div className="text-xs text-slate-400 truncate text-center">
              {bone.landmark}
            </div>
          </div>
        );
      })}
    </div>
  );
}
