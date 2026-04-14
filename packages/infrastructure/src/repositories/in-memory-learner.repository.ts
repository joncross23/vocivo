import type { LearnerEntryState, LearnerRepository, SetAggregate } from '@vocivo/contracts';

interface CreateInMemoryLearnerRepositoryOptions {
  entryStates?: LearnerEntryState[];
  setAggregates?: SetAggregate[];
}

export function createInMemoryLearnerRepository({
  entryStates: initialEntryStates = [],
  setAggregates: initialSetAggregates = [],
}: CreateInMemoryLearnerRepositoryOptions = {}): LearnerRepository {
  const entryStates = new Map<string, LearnerEntryState>(
    initialEntryStates.map((entryState) => [entryState.entryId, entryState]),
  );
  const setAggregates = new Map<string, SetAggregate>(
    initialSetAggregates.map((setAggregate) => [setAggregate.setId, setAggregate]),
  );

  return {
    async listEntryStates() {
      return [...entryStates.values()];
    },
    async getEntryState(entryId) {
      return entryStates.get(entryId) ?? null;
    },
    async saveEntryState(entryState) {
      entryStates.set(entryState.entryId, entryState);
    },
    async getSetAggregate(setId) {
      return setAggregates.get(setId) ?? null;
    },
    async saveSetAggregate(setAggregate) {
      setAggregates.set(setAggregate.setId, setAggregate);
    },
  };
}
