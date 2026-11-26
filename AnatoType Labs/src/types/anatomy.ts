export type DeckId =
  | 'foot-tarsals'
  | 'hand-carpals'
  | 'cranium-skull'
  | 'limbs'
  | 'shoulder-thorax'
  | 'pelvis-spine'
  | 'head-neck-muscles'
  | 'upper-muscles'
  | 'lower-muscles';

export type StructureCategory = 'bone' | 'muscle';

export type GameMode = 'standard' | 'hardcore';

export interface MuscleInfo {
  origin: string;
  insertion: string;
  nerveSupply: string;
  action: string;
}

export interface BoneInfo {
  classification: string;
  articulations: string;
  landmarks: string;
  clinicalNote: string;
}

export interface BoneItem {
  id: string;
  name: string;
  landmark: string;
  fallbackMnemonic: string;
  muscleInfo?: MuscleInfo;
  boneInfo?: BoneInfo;
}

export interface AnatomyDeck {
  id: DeckId;
  category: StructureCategory;
  name: string;
  viewLabel: string;
  description: string;
  bones: BoneItem[];
}

export interface BoneAttemptRecord {
  boneId: string;
  boneName: string;
  durationMs: number;
  mistakes: number;
  hintsUsed: number;
}
