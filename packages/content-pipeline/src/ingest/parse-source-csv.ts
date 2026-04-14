import { parse } from 'csv-parse/sync';
import type { SourceCsvRow } from './normalize-source-row';

export function parseSourceCsv(csvText: string): SourceCsvRow[] {
  return parse(csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: false,
    relax_column_count: true,
  }) as SourceCsvRow[];
}
