import { useEffect, useRef } from 'react';
import { BookOpen, Eye, Info } from 'lucide-react';
import type { BoneItem, GameMode, StructureCategory } from '../types/anatomy';

interface TypingCardProps {
  bone: BoneItem;
  category: StructureCategory;
  deckName: string;
  itemIndex: number;
  totalItems: number;
  mode: GameMode;
  typedCount: number;
  isErrorShake: boolean;
  isCompletedFlash: boolean;
  mnemonicText: string | null;
  showInfo: boolean;
  onCharInput: (char: string) => void;
  onShowHint: () => void;
  onShowMnemonic: () => void;
  onToggleInfo: () => void;
  disabled: boolean;
}

export function TypingCard({
  bone,
  category,
  deckName,
  itemIndex,
  totalItems,
  mode,
  typedCount,
  isErrorShake,
  isCompletedFlash,
  mnemonicText,
  showInfo,
  onCharInput,
  onShowHint,
  onShowMnemonic,
  onToggleInfo,
  disabled,
}: TypingCardProps) {
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const targetName = bone.name;
  const chars = targetName.split('');

  // Global direct keyboard capture
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (
        document.activeElement &&
        document.activeElement !== mobileInputRef.current &&
        (document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        onCharInput(' ');
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onCharInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onCharInput]);

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const lastChar = val[val.length - 1];
      if (/^[a-zA-Z ]$/.test(lastChar)) {
        onCharInput(lastChar);
      }
    }
    e.target.value = '';
  };

  const canRevealHint = !isCompletedFlash && typedCount < targetName.length;
  const hasInfo =
    (category === 'muscle' && Boolean(bone.muscleInfo)) ||
    (category === 'bone' && Boolean(bone.boneInfo));

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-[#181B22] border border-[#2A2F3A] p-5 sm:p-7">
      {/* Top metadata bar — clean unboxed typography */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-400 pb-4 border-b border-[#2A2F3A]/80">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-medium">
            Item {itemIndex + 1} of {totalItems}
          </span>
          <span aria-hidden="true">·</span>
          <span>{deckName}</span>
          <span aria-hidden="true">·</span>
          <span>{mode === 'standard' ? 'Standard Mode' : 'Hardcore Mode'}</span>
        </div>
        <span className="text-slate-500">Type directly on keyboard</span>
      </div>

      {/* Masked Word Display + Tappable Mobile Input */}
      <div
        onClick={() => mobileInputRef.current?.focus()}
        className={`relative mt-6 mb-6 py-4 px-3 rounded-lg bg-[#0E1015] border border-[#2A2F3A]/90 flex flex-wrap items-center justify-center gap-y-2 cursor-text ${
          isErrorShake ? 'animate-shake-x border-red-500/70' : ''
        } ${isCompletedFlash ? 'border-emerald-500/70 bg-emerald-950/20' : ''}`}
      >
        {/* Hidden input for mobile virtual keyboards */}
        <input
          ref={mobileInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Type anatomical structure name"
          onChange={handleMobileInput}
          className="sr-only"
        />

        <div
          className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-1.5 font-mono text-2xl sm:text-3xl font-semibold tracking-[0.12em]"
          aria-live="polite"
        >
          {chars.map((char, idx) => {
            if (char === ' ') {
              return (
                <span
                  key={idx}
                  className="inline-block w-3 sm:w-4"
                  aria-hidden="true"
                />
              );
            }

            const isRevealed = idx < typedCount;
            const isCursor = idx === typedCount && !isCompletedFlash;

            let charColorClass = 'text-slate-500';
            if (isCompletedFlash) {
              charColorClass = 'text-emerald-400';
            } else if (isRevealed) {
              charColorClass = 'text-slate-50';
            } else if (isCursor && isErrorShake) {
              charColorClass = 'text-red-400';
            }

            return (
              <span
                key={idx}
                className={`relative inline-flex items-center justify-center min-w-[0.75em] transition-colors duration-100 ${charColorClass}`}
              >
                {isRevealed || isCompletedFlash ? char.toLowerCase() : '•'}
                {isCursor && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full ${
                      isErrorShake ? 'bg-red-500' : 'bg-sky-400'
                    }`}
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onShowHint}
            disabled={!canRevealHint}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[#2A2F3A] bg-[#0E1015] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Eye className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>Show Hint</span>
          </button>

          <button
            type="button"
            onClick={onShowMnemonic}
            aria-expanded={Boolean(mnemonicText)}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              mnemonicText
                ? 'border-amber-500/60 bg-[#1F242E] text-slate-100'
                : 'border-[#2A2F3A] bg-[#0E1015] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Study Mnemonic</span>
          </button>

          {hasInfo && (
            <button
              type="button"
              onClick={onToggleInfo}
              aria-expanded={showInfo}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                showInfo
                  ? 'border-sky-500/60 bg-[#1F242E] text-slate-100'
                  : 'border-[#2A2F3A] bg-[#0E1015] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500'
              }`}
            >
              <Info className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span>Information</span>
            </button>
          )}
        </div>

        <span className="text-xs font-mono tabular-nums text-slate-500 sm:hidden">
          Tap box to open keyboard
        </span>
      </div>

      {/* Study Mnemonic Output */}
      {mnemonicText && (
        <div className="mt-4 pt-4 border-t border-[#2A2F3A]/80 text-sm text-slate-300 leading-relaxed">
          <span className="text-xs font-mono text-amber-400 mr-2">
            Study Tip ·
          </span>
          <span>{mnemonicText}</span>
        </div>
      )}

      {/* Structured Information Panel */}
      {showInfo && category === 'muscle' && bone.muscleInfo && (
        <div className="mt-4 pt-4 border-t border-[#2A2F3A]/80">
          <h3 className="text-xs font-mono tracking-wide text-sky-400 mb-3">
            Information
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
            <div>
              <dt className="text-xs font-mono text-slate-400">Origin</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.muscleInfo.origin}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Insertion</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.muscleInfo.insertion}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Nerve Supply</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.muscleInfo.nerveSupply}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Action</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.muscleInfo.action}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {showInfo && category === 'bone' && bone.boneInfo && (
        <div className="mt-4 pt-4 border-t border-[#2A2F3A]/80">
          <h3 className="text-xs font-mono tracking-wide text-sky-400 mb-3">
            Information
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
            <div>
              <dt className="text-xs font-mono text-slate-400">Classification</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.boneInfo.classification}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Articulations</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.boneInfo.articulations}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Key Landmarks</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.boneInfo.landmarks}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">Clinical Note</dt>
              <dd className="mt-0.5 text-slate-200 leading-snug">
                {bone.boneInfo.clinicalNote}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
