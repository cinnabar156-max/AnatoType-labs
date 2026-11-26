import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Flame, RotateCcw, Target, Shield, Volume2, VolumeX } from 'lucide-react';
import { AnatomyCarousel } from './components/AnatomyCarousel';
import { DeckSelector } from './components/DeckSelector';
import { DeckSummaryModal } from './components/DeckSummaryModal';
import { TypingCard } from './components/TypingCard';
import { ANATOMY_DECKS } from './data/anatomyDecks';
import type { AnatomyDeck, BoneAttemptRecord, GameMode } from './types/anatomy';
import { SoundEngine } from './utils/soundEngine';

const MASTERED_STORAGE_KEY = 'anatotype_mastered_bones_v1';
const SOUND_STORAGE_KEY = 'anatotype_sound_enabled_v1';

function getInitialTypedCount(boneName: string, mode: GameMode): number {
  if (mode === 'hardcore') return 0;
  return Math.min(2, boneName.length);
}

function advancePastSpaces(word: string, index: number): number {
  let next = index;
  while (next < word.length && word[next] === ' ') {
    next += 1;
  }
  return next;
}

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [masteredBoneIds, setMasteredBoneIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(MASTERED_STORAGE_KEY);
      if (!saved) return new Set();
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
      return new Set();
    }
  });

  const [mode, setMode] = useState<GameMode>('standard');
  const [activeDeck, setActiveDeck] = useState<AnatomyDeck | null>(null);

  // Stage 2 gameplay state
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [isCompletedFlash, setIsCompletedFlash] = useState(false);

  const [streak, setStreak] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wrongKeystrokes, setWrongKeystrokes] = useState(0);
  const [records, setRecords] = useState<BoneAttemptRecord[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [totalDeckTimeMs, setTotalDeckTimeMs] = useState(0);

  // Local study mnemonic & information state
  const [mnemonicText, setMnemonicText] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Timers & per-item metrics
  const deckStartTimeRef = useRef<number>(0);
  const boneStartTimeRef = useRef<number>(0);
  const boneMistakesRef = useRef<number>(0);
  const boneHintsRef = useRef<number>(0);
  const shakeTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    SoundEngine.setEnabled(soundEnabled);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch {
      // Ignore storage errors
    }
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const markBoneMastered = useCallback((boneId: string) => {
    setMasteredBoneIds((prev) => {
      if (prev.has(boneId)) return prev;
      const next = new Set(prev);
      next.add(boneId);
      try {
        localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const startDeckSession = useCallback(
    (deck: AnatomyDeck) => {
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);

      const firstBone = deck.bones[0];
      const now = Date.now();
      deckStartTimeRef.current = now;
      boneStartTimeRef.current = now;
      boneMistakesRef.current = 0;
      boneHintsRef.current = 0;

      setActiveDeck(deck);
      setActiveIndex(0);
      setTypedCount(getInitialTypedCount(firstBone.name, mode));
      setIsErrorShake(false);
      setIsCompletedFlash(false);
      setStreak(0);
      setCorrectKeystrokes(0);
      setWrongKeystrokes(0);
      setRecords([]);
      setShowSummary(false);
      setTotalDeckTimeMs(0);
      setMnemonicText(null);
      setShowInfo(false);
    },
    [mode]
  );

  const handleBackToDecks = useCallback(() => {
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setActiveDeck(null);
    setShowSummary(false);
  }, []);

  const handleResetAllProgress = useCallback(() => {
    SoundEngine.playKeyClick();
    setMasteredBoneIds(new Set());
    try {
      localStorage.removeItem(MASTERED_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleResetCurrentDeck = useCallback(() => {
    if (!activeDeck) return;
    SoundEngine.playKeyClick();
    const deckBoneIds = new Set(activeDeck.bones.map((b) => b.id));
    setMasteredBoneIds((prev) => {
      const next = new Set([...prev].filter((id) => !deckBoneIds.has(id)));
      try {
        localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    startDeckSession(activeDeck);
  }, [activeDeck, startDeckSession]);

  const triggerWordComplete = useCallback(
    (deck: AnatomyDeck, index: number) => {
      const bone = deck.bones[index];
      const now = Date.now();
      const durationMs = Math.max(150, now - boneStartTimeRef.current);

      SoundEngine.playSuccessChime();
      setStreak((s) => s + 1);
      markBoneMastered(bone.id);
      setIsCompletedFlash(true);

      setRecords((prev) => [
        ...prev,
        {
          boneId: bone.id,
          boneName: bone.name,
          durationMs,
          mistakes: boneMistakesRef.current,
          hintsUsed: boneHintsRef.current,
        },
      ]);

      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex < deck.bones.length) {
          const nextBone = deck.bones[nextIndex];
          setActiveIndex(nextIndex);
          setTypedCount(getInitialTypedCount(nextBone.name, mode));
          setIsCompletedFlash(false);
          setIsErrorShake(false);
          setMnemonicText(null);
          setShowInfo(false);
          boneStartTimeRef.current = Date.now();
          boneMistakesRef.current = 0;
          boneHintsRef.current = 0;
        } else {
          setTotalDeckTimeMs(Date.now() - deckStartTimeRef.current);
          setIsCompletedFlash(false);
          setShowSummary(true);
          SoundEngine.playDeckComplete();
        }
      }, 450);
    },
    [markBoneMastered, mode]
  );

  const handleCharInput = useCallback(
    (rawChar: string) => {
      if (!activeDeck || isCompletedFlash || showSummary) return;

      const currentBone = activeDeck.bones[activeIndex];
      const targetWord = currentBone.name;

      if (typedCount >= targetWord.length) return;

      // Gracefully accept spacebar right after crossing a word boundary
      if (
        rawChar === ' ' &&
        typedCount > 0 &&
        targetWord[typedCount - 1] === ' '
      ) {
        return;
      }

      const expectedChar = targetWord[typedCount];
      if (rawChar.toLowerCase() === expectedChar.toLowerCase()) {
        SoundEngine.playKeyClick();
        setCorrectKeystrokes((c) => c + 1);

        const nextCount = advancePastSpaces(targetWord, typedCount + 1);
        setTypedCount(nextCount);

        if (nextCount >= targetWord.length) {
          triggerWordComplete(activeDeck, activeIndex);
        }
      } else {
        SoundEngine.playErrorThud();
        setWrongKeystrokes((w) => w + 1);
        boneMistakesRef.current += 1;
        setStreak(0);

        setIsErrorShake(false);
        if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
        window.requestAnimationFrame(() => {
          setIsErrorShake(true);
        });
        shakeTimerRef.current = window.setTimeout(() => {
          setIsErrorShake(false);
        }, 260);
      }
    },
    [activeDeck, activeIndex, isCompletedFlash, showSummary, triggerWordComplete, typedCount]
  );

  const handleShowHint = useCallback(() => {
    if (!activeDeck || isCompletedFlash || showSummary) return;

    const currentBone = activeDeck.bones[activeIndex];
    const targetWord = currentBone.name;
    if (typedCount >= targetWord.length) return;

    SoundEngine.playKeyClick();
    boneHintsRef.current += 1;

    const nextCount = advancePastSpaces(targetWord, typedCount + 1);
    setTypedCount(nextCount);

    if (nextCount >= targetWord.length) {
      triggerWordComplete(activeDeck, activeIndex);
    }
  }, [activeDeck, activeIndex, isCompletedFlash, showSummary, triggerWordComplete, typedCount]);

  const handleShowMnemonic = useCallback(() => {
    if (!activeDeck) return;
    const currentBone = activeDeck.bones[activeIndex];
    setMnemonicText((prev) =>
      prev === currentBone.fallbackMnemonic ? null : currentBone.fallbackMnemonic
    );
  }, [activeDeck, activeIndex]);

  const totalAttempts = correctKeystrokes + wrongKeystrokes;
  const accuracyPercent =
    totalAttempts === 0
      ? 100
      : Math.round((correctKeystrokes / totalAttempts) * 100);

  if (!activeDeck) {
    return (
      <DeckSelector
        decks={ANATOMY_DECKS}
        mode={mode}
        onModeChange={setMode}
        onSelectDeck={startDeckSession}
        masteredBoneIds={masteredBoneIds}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onResetProgress={handleResetAllProgress}
      />
    );
  }

  const currentBone = activeDeck.bones[activeIndex];

  return (
    <div className="min-h-screen bg-[#0E1015] text-slate-100 flex flex-col">
      {/* Top Controls Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBackToDecks}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[#2A2F3A] bg-[#181B22] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span>Back to Decks</span>
        </button>

        <div className="hidden sm:block text-xs font-mono text-slate-400 whitespace-nowrap">
          AnatoType Labs · {activeDeck.viewLabel}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetCurrentDeck}
            title="Restart deck and clear its progress"
            aria-label="Reset current deck"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#2A2F3A] bg-[#181B22] text-slate-300 hover:bg-[#1F242E] hover:text-slate-100 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium border border-[#2A2F3A] bg-[#181B22] text-slate-200 hover:bg-[#1F242E] hover:border-slate-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
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
      </header>

      {/* Main Gameplay Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 gap-5 sm:gap-6 pb-20 md:pb-10">
        {/* 3-Card Horizontal Anatomy Carousel */}
        <AnatomyCarousel
          deckId={activeDeck.id}
          bones={activeDeck.bones}
          activeIndex={activeIndex}
          isCompletedFlash={isCompletedFlash}
        />

        {/* Live Character-by-Character Typing Card */}
        <TypingCard
          bone={currentBone}
          category={activeDeck.category}
          deckName={activeDeck.name}
          itemIndex={activeIndex}
          totalItems={activeDeck.bones.length}
          mode={mode}
          typedCount={typedCount}
          isErrorShake={isErrorShake}
          isCompletedFlash={isCompletedFlash}
          mnemonicText={mnemonicText}
          showInfo={showInfo}
          onCharInput={handleCharInput}
          onShowHint={handleShowHint}
          onShowMnemonic={handleShowMnemonic}
          onToggleInfo={() => setShowInfo((v) => !v)}
          disabled={showSummary || isCompletedFlash}
        />
      </main>

      {/* Bottom-Left Gamification Widget */}
      <aside
        aria-label="Session telemetry"
        className="md:fixed md:bottom-5 md:left-6 mx-4 mb-4 md:mx-0 md:mb-0 rounded-xl bg-[#181B22]/95 border border-[#2A2F3A] backdrop-blur-md px-4 py-2.5 flex items-center justify-between md:justify-start gap-5 text-xs font-mono tabular-nums"
      >
        <div className="flex items-center gap-2">
          <Flame
            className={`w-4 h-4 ${streak > 0 ? 'text-amber-400' : 'text-slate-500'}`}
            aria-hidden="true"
          />
          <div>
            <span className="text-slate-400 mr-1.5">Streak</span>
            <span className="text-slate-100 font-semibold">{streak}</span>
          </div>
        </div>

        <span className="text-[#2A2F3A]" aria-hidden="true">|</span>

        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" aria-hidden="true" />
          <div>
            <span className="text-slate-400 mr-1.5">Accuracy</span>
            <span className="text-slate-100 font-semibold">{accuracyPercent}%</span>
          </div>
        </div>

        <span className="text-[#2A2F3A]" aria-hidden="true">|</span>

        <div className="flex items-center gap-2">
          <Shield
            className={`w-4 h-4 ${mode === 'hardcore' ? 'text-red-400' : 'text-emerald-400'}`}
            aria-hidden="true"
          />
          <span className="text-slate-200 font-medium">
            {mode === 'hardcore' ? 'Hardcore' : 'Standard'}
          </span>
        </div>
      </aside>

      {/* Deck Completion Summary Modal */}
      {showSummary && (
        <DeckSummaryModal
          deckName={activeDeck.name}
          category={activeDeck.category}
          mode={mode}
          accuracyPercent={accuracyPercent}
          totalTimeMs={totalDeckTimeMs}
          records={records}
          onPlayAgain={() => startDeckSession(activeDeck)}
          onChooseAnotherDeck={handleBackToDecks}
        />
      )}
    </div>
  );
}
