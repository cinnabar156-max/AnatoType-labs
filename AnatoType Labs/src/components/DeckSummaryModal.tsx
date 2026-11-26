import { Award, RotateCcw, Layers } from 'lucide-react';
import type { BoneAttemptRecord, GameMode, StructureCategory } from '../types/anatomy';

interface DeckSummaryModalProps {
  deckName: string;
  category: StructureCategory;
  mode: GameMode;
  accuracyPercent: number;
  totalTimeMs: number;
  records: BoneAttemptRecord[];
  onPlayAgain: () => void;
  onChooseAnotherDeck: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(1);
  if (mins > 0) {
    return `${mins}m ${secs.padStart(4, '0')}s`;
  }
  return `${secs}s`;
}

export function DeckSummaryModal({
  deckName,
  category,
  mode,
  accuracyPercent,
  totalTimeMs,
  records,
  onPlayAgain,
  onChooseAnotherDeck,
}: DeckSummaryModalProps) {
  const fastest = records.reduce<BoneAttemptRecord | null>((best, curr) => {
    if (!best || curr.durationMs < best.durationMs) return curr;
    return best;
  }, null);

  const pluralLabel = category === 'muscle' ? 'muscles' : 'bones';
  const fastestLabel = category === 'muscle' ? 'Fastest Muscle' : 'Fastest Bone';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg rounded-xl bg-[#181B22] border border-[#2A2F3A] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 text-emerald-400">
          <Award className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono tracking-wide uppercase">
            Deck Completed
          </span>
        </div>

        <h2
          id="summary-modal-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-slate-100"
        >
          {deckName}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Completed {records.length} {pluralLabel} in{' '}
          {mode === 'standard' ? 'Standard Mode' : 'Hardcore Mode'}.
        </p>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 py-4 border-y border-[#2A2F3A]">
          <div>
            <div className="text-xs text-slate-400">Accuracy</div>
            <div className="mt-1 text-xl sm:text-2xl font-mono font-semibold tabular-nums text-slate-100">
              {accuracyPercent}%
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Time Taken</div>
            <div className="mt-1 text-xl sm:text-2xl font-mono font-semibold tabular-nums text-slate-100">
              {formatDuration(totalTimeMs)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">{fastestLabel}</div>
            <div className="mt-1 text-base sm:text-lg font-mono font-semibold tabular-nums text-emerald-400 truncate">
              {fastest ? fastest.boneName : '—'}
            </div>
            {fastest && (
              <div className="text-xs font-mono tabular-nums text-slate-500">
                {(fastest.durationMs / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onChooseAnotherDeck}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#2A2F3A] bg-[#0E1015] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>Choose Another Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
}
