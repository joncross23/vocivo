import type { LearnerEntryState } from '../learner/learner-entry-state.schema';
import type { LearnerProfile } from '../learner/learner-profile.schema';
import type { SetAggregate } from '../learner/set-aggregate.schema';

export interface LearnerRepository {
  getProfile(): Promise<LearnerProfile>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  listEntryStates(): Promise<LearnerEntryState[]>;
  getEntryState(entryId: string): Promise<LearnerEntryState | null>;
  saveEntryState(entryState: LearnerEntryState): Promise<void>;
  getSetAggregate(setId: string): Promise<SetAggregate | null>;
  saveSetAggregate(setAggregate: SetAggregate): Promise<void>;
}
