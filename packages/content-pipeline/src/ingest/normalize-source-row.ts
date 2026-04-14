export interface SourceCsvRow {
  source_index?: string;
  source_label?: string;
  source_url?: string;
  source_theme_group: string;
  source_topic: string;
  source_word_type: string;
  source_url_deck_id: string;
  card_index_in_deck?: string;
  card_flashcardId?: string;
  card_term_text: string;
  card_definition_text: string;
  card_term?: string;
  card_definition?: string;
  card_termAudio?: string;
  card_definitionAudio?: string;
}

export interface NormalizedSourceRow {
  sourceIndex: number | null;
  sourceLabel: string;
  sourceUrl: string;
  sourceThemeGroup: string;
  sourceTopic: string;
  sourceWordType: string;
  sourceDeckId: string;
  cardIndexInDeck: number | null;
  sourceItemId: string;
  spanish: string;
  rawDefinition: string;
  spanishAudioUrl: string | null;
  englishAudioUrl: string | null;
}

export function normalizeSourceRow(row: SourceCsvRow): NormalizedSourceRow {
  const spanish = firstNonEmpty(row.card_term_text, row.card_term);
  const rawDefinition = firstNonEmpty(row.card_definition_text, row.card_definition);

  return {
    sourceIndex: toInteger(row.source_index),
    sourceLabel: (row.source_label ?? '').trim(),
    sourceUrl: (row.source_url ?? '').trim(),
    sourceThemeGroup: row.source_theme_group.trim(),
    sourceTopic: row.source_topic.trim(),
    sourceWordType: row.source_word_type.trim(),
    sourceDeckId: row.source_url_deck_id.trim(),
    cardIndexInDeck: toInteger(row.card_index_in_deck),
    sourceItemId: (row.card_flashcardId ?? '').trim(),
    spanish,
    rawDefinition,
    spanishAudioUrl: normalizeOptionalString(row.card_termAudio),
    englishAudioUrl: normalizeOptionalString(row.card_definitionAudio),
  };
}

export function hasRequiredContent(row: NormalizedSourceRow): boolean {
  return row.spanish.length > 0 && row.rawDefinition.length > 0;
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const normalized = stripHtml(value ?? '').trim();

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return '';
}

function normalizeOptionalString(value: string | undefined): string | null {
  const normalized = (value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function toInteger(value: string | undefined): number | null {
  const normalized = (value ?? '').trim();

  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
