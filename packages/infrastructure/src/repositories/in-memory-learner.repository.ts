import type { LearnerEntryState, LearnerRepository, SetAggregate } from '@vocivo/contracts';

export function createInMemoryLearnerRepository(): LearnerRepository {
  const entryStates = new Map<string, LearnerEntryState>();
  const setAggregates = new Map<string, SetAggregate>();

  return {
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
