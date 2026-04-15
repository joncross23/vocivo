import {
  learnerEntryStateSchema,
  learnerProfileSchema,
  setAggregateSchema,
  type LearnerEntryState,
  type LearnerProfile,
  type LearnerRepository,
  type SetAggregate,
} from '@vocivo/contracts';

interface PersistedLearnerState {
  profile: LearnerProfile;
  entryStates: LearnerEntryState[];
  setAggregates: SetAggregate[];
}

export const DEFAULT_LEARNER_STORAGE_KEY = 'vocivo.learner.v1';

export interface LearnerStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CreateLocalStorageLearnerRepositoryOptions {
  storage: LearnerStorageLike;
  storageKey?: string;
}

export function createLocalStorageLearnerRepository({
  storage,
  storageKey = DEFAULT_LEARNER_STORAGE_KEY,
}: CreateLocalStorageLearnerRepositoryOptions): LearnerRepository {
  return {
    async getProfile() {
      return readState(storage, storageKey).profile;
    },
    async saveProfile(profile) {
      const state = readState(storage, storageKey);
      writeState(storage, storageKey, {
        ...state,
        profile,
      });
    },
    async listEntryStates() {
      return readState(storage, storageKey).entryStates;
    },
    async getEntryState(entryId) {
      return readState(storage, storageKey).entryStates.find(
        (entryState) => entryState.entryId === entryId,
      ) ?? null;
    },
    async saveEntryState(entryState: LearnerEntryState) {
      const state = readState(storage, storageKey);

      writeState(storage, storageKey, {
        ...state,
        entryStates: upsertByKey(state.entryStates, entryState, (item) => item.entryId),
      });
    },
    async listSetAggregates() {
      return readState(storage, storageKey).setAggregates;
    },
    async getSetAggregate(setId) {
      return readState(storage, storageKey).setAggregates.find(
        (setAggregate) => setAggregate.setId === setId,
      ) ?? null;
    },
    async saveSetAggregate(setAggregate: SetAggregate) {
      const state = readState(storage, storageKey);

      writeState(storage, storageKey, {
        ...state,
        setAggregates: upsertByKey(
          state.setAggregates,
          setAggregate,
          (item) => item.setId,
        ),
      });
    },
  };
}

function readState(
  storage: LearnerStorageLike,
  storageKey: string,
): PersistedLearnerState {
  const rawValue = storage.getItem(storageKey);

  if (rawValue === null) {
    return createEmptyState();
  }

  try {
    return parsePersistedState(JSON.parse(rawValue));
  } catch {
    return createEmptyState();
  }
}

function writeState(
  storage: LearnerStorageLike,
  storageKey: string,
  state: PersistedLearnerState,
): void {
  storage.setItem(storageKey, JSON.stringify(state));
}

function createEmptyState(): PersistedLearnerState {
  return {
    profile: {
      totalXp: 0,
      currentLevel: 0,
      streakDays: 0,
    },
    entryStates: [],
    setAggregates: [],
  };
}

function parsePersistedState(rawValue: unknown): PersistedLearnerState {
  const persistedState = rawValue as {
    profile?: unknown;
    entryStates?: unknown;
    setAggregates?: unknown;
  };

  return {
    profile: learnerProfileSchema.parse(persistedState.profile),
    entryStates: learnerEntryStateSchema.array().parse(persistedState.entryStates),
    setAggregates: setAggregateSchema.array().parse(persistedState.setAggregates),
  };
}

function upsertByKey<T>(
  items: T[],
  nextItem: T,
  getKey: (item: T) => string,
): T[] {
  const nextKey = getKey(nextItem);
  const nextItems = items.filter((item) => getKey(item) !== nextKey);
  nextItems.push(nextItem);
  return nextItems;
}
