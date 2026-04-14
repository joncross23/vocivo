import type { ContentEntry } from '../content/content-entry.schema';
import type { ContentSetSummary } from '../content/content-set.schema';
import type { SessionSelection } from '../practice/session-request.schema';

export interface ContentRepository {
  getSetSummaries(selection?: SessionSelection): Promise<ContentSetSummary[]>;
  getEntries(selection: SessionSelection, limit: number): Promise<ContentEntry[]>;
}
