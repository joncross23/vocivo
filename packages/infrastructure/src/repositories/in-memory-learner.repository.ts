import type {
  LearnerEntryState,
  LearnerProfile,
  LearnerRepository,
  SetAggregate,
} from '@vocivo/contracts';

interface CreateInMemoryLearnerRepositoryOptions {
  profile?: LearnerProfile;
  entryStates?: LearnerEntryState[];
  setAggregates?: SetAggregate[];
}

export function createInMemoryLearnerRepository({
  profile: initialProfile = {
    totalXp: 0,
    currentLevel: 0,
    streakDays: 0,
  },
  entryStates: initialEntryStates = [],
  setAggregates: initialSetAggregates = [],
}: CreateInMemoryLearnerRepositoryOptions = {}): LearnerRepository {
  let profile = initialProfile;
  const entryStates = new Map<string, LearnerEntryState>(
    initialEntryStates.map((entryState) => [entryState.entryId, entryState]),
  );
  const setAggregates = new Map<string, SetAggregate>(
    initialSetAggregates.map((setAggregate) => [setAggregate.setId, setAggregate]),
  );

  return {
    async getProfile() {
      return profile;
    },
    async saveProfile(nextProfile) {
      profile = nextProfile;
    },
    async listEntryStates() {
      return [...entryStates.values()];
    },
    async getEntryState(entryId) {
      return entryStates.get(entryId) ?? null;
    },
    async saveEntryState(entryState) {
      entryStates.set(entryState.entryId, entryState);
    },
    async listSetAggregates() {
      return [...setAggregates.values()];
    },
    async getSetAggregate(setId) {
      return setAggregates.get(setId) ?? null;
    },
    async saveSetAggregate(setAggregate) {
      setAggregates.set(setAggregate.setId, setAggregate);
    },
  };
}
