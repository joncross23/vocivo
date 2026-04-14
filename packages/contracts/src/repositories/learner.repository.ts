import type { LearnerEntryState } from '../learner/learner-entry-state.schema';
import type { SetAggregate } from '../learner/set-aggregate.schema';

export interface LearnerRepository {
  getEntryState(entryId: string): Promise<LearnerEntryState | null>;
  saveEntryState(entryState: LearnerEntryState): Promise<void>;
  getSetAggregate(setId: string): Promise<SetAggregate | null>;
  saveSetAggregate(setAggregate: SetAggregate): Promise<void>;
}
