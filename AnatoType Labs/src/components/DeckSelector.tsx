import { useState } from 'react';
import { ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { TOTAL_BONE_COUNT } from '../data/anatomyDecks';
import type { AnatomyDeck, GameMode, StructureCategory } from '../types/anatomy';
import { XRaySVG } from './XRaySVG';

type CategoryFilter = 'all' | StructureCategory;

interface DeckSelectorProps {
  decks: AnatomyDeck[];
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onSelectDeck: (deck: AnatomyDeck) => void;
  masteredBoneIds: Set<string>;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export function DeckSelector({
  decks,
  mode,
  onModeChange,
  onSelectDeck,
  masteredBoneIds,
  soundEnabled,
  onToggleSound,
  onResetProgress,
}: DeckSelectorProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const masteredTotal = decks.reduce(
    (sum, deck) =>
      sum + deck.bones.filter((b) => masteredBoneIds.has(b.id)).length,
    0
  );
  const overallPercent = Math.round((masteredTotal / TOTAL_BONE_COUNT) * 100);

  const boneDeckCount = decks.filter((d) => d.category === 'bone').length;
  const muscleDeckCount = decks.filter((d) => d.category === 'muscle').length;

  const visibleDecks =
    filter === 'all' ? decks : decks.filter((d) => d.category === filter);

  return (
    <div className="min-h-screen bg-[#0B0D11] text-slate-100 flex flex-col">
      {/* Minimalist Header */}
      <header className="border-b border-[#2A2F3A]/80 bg-[#0B0D11]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <div className="text-lg font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            AnatoType Labs
          </div>

          <div className="hidden sm:flex items-center gap-4 flex-1 max-w-md">
            <div className="flex-1 h-1.5 bg-[#181B22] rounded-full overflow-hidden border border-[#2A2F3A]">
              <div
                className="h-full bg-sky-400 transition-[width] duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
              {masteredTotal}/{TOTAL_BONE_COUNT} mastered · {overallPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onResetProgress}
              disabled={masteredTotal === 0}
              title="Reset all mastery progress"
              aria-label="Reset all mastery progress"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#2A2F3A] bg-[#181B22] text-slate-300 hover:bg-[#1F242E] hover:text-slate-100 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium border border-[#2A2F3A] bg-[#181B22] text-slate-200 hover:bg-[#1F242E] hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" aria-hidden="true" />
                  <span>Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span className="text-slate-400">Sound Off</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero & Mode Selector Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#2A2F3A]/70">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 [text-wrap:balance]">
              Radiographic & Myology Identification
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
              Select a skeletal or muscular region to drill anatomical nomenclature directly from highlighted plates.
            </p>
            {/* Mobile mastery line */}
            <div className="mt-4 flex sm:hidden items-center gap-3">
              <div className="flex-1 h-1.5 bg-[#181B22] rounded-full overflow-hidden border border-[#2A2F3A]">
                <div
                  className="h-full bg-sky-400 transition-[width] duration-300"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
                {masteredTotal}/{TOTAL_BONE_COUNT} · {overallPercent}%
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400">
              Typing Mode
            </span>
            <div
              role="group"
              aria-label="Typing difficulty mode"
              className="inline-flex p-1 rounded-xl bg-[#181B22] border border-[#2A2F3A]"
            >
              <button
                type="button"
                onClick={() => onModeChange('standard')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  mode === 'standard'
                    ? 'bg-[#262B36] text-slate-100 border border-slate-600/60'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Standard Mode <span className="ml-1.5 font-mono text-xs text-slate-400">ta•••</span>
              </button>
              <button
                type="button"
                onClick={() => onModeChange('hardcore')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  mode === 'hardcore'
                    ? 'bg-[#262B36] text-slate-100 border border-slate-600/60'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Hardcore Mode <span className="ml-1.5 font-mono text-xs text-slate-400">•••••</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter anatomical decks"
            className="inline-flex p-1 rounded-lg bg-[#181B22] border border-[#2A2F3A]"
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                filter === 'all'
                  ? 'bg-[#262B36] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Regions ({decks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('bone')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                filter === 'bone'
                  ? 'bg-[#262B36] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bones ({boneDeckCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('muscle')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                filter === 'muscle'
                  ? 'bg-[#262B36] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Muscles ({muscleDeckCount})
            </button>
          </div>

          <span className="text-xs font-mono tabular-nums text-slate-400">
            41 bones · 20 muscles
          </span>
        </div>

        {/* Category Grid */}
        <section aria-label="Anatomical regions" className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleDecks.map((deck) => {
            const masteredCount = deck.bones.filter((b) =>
              masteredBoneIds.has(b.id)
            ).length;
            const masteryPct = Math.round(
              (masteredCount / deck.bones.length) * 100
            );
            const unitLabel = deck.category === 'muscle' ? 'muscles' : 'bones';
            const systemLabel = deck.category === 'muscle' ? 'Muscular' : 'Skeletal';

            return (
              <button
                key={deck.id}
                type="button"
                onClick={() => onSelectDeck(deck)}
                className="group text-left rounded-xl bg-[#181B22] border border-[#2A2F3A] hover:border-slate-500/80 hover:bg-[#1C2029] transition-all duration-200 p-5 sm:p-6 flex flex-col sm:flex-row items-stretch gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                {/* X-ray / Myology SVG thumbnail */}
                <div className="sm:w-44 h-36 sm:h-auto shrink-0 rounded-lg bg-[#0E1015] border border-[#2A2F3A] flex items-center justify-center p-2 overflow-hidden">
                  <XRaySVG
                    deckId={deck.id}
                    activeBoneId={deck.bones[0]?.id}
                    highlightState="idle"
                    compact
                    className="w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>

                {/* Deck Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-100 tracking-tight truncate">
                        {deck.name}
                      </h2>
                      <ArrowRight
                        className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono tabular-nums text-slate-400">
                      <span>{systemLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{deck.bones.length} {unitLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{deck.viewLabel}</span>
                    </div>

                    <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-2">
                      {deck.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#2A2F3A]/80 flex items-center justify-between gap-4">
                    <div className="flex-1 h-1.5 bg-[#0E1015] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-[width] duration-300"
                        style={{ width: `${masteryPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-300 whitespace-nowrap shrink-0">
                      {masteryPct}% mastery
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
