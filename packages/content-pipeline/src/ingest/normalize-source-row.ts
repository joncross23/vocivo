export interface SourceCsvRow {
  source_theme_group: string;
  source_topic: string;
  source_word_type: string;
  source_url_deck_id: string;
  card_term_text: string;
  card_definition_text: string;
}

export function normalizeSourceRow(row: SourceCsvRow): SourceCsvRow {
  return {
    ...row,
    source_theme_group: row.source_theme_group.trim(),
    source_topic: row.source_topic.trim(),
    source_word_type: row.source_word_type.trim(),
    source_url_deck_id: row.source_url_deck_id.trim(),
    card_term_text: row.card_term_text.trim(),
    card_definition_text: row.card_definition_text.trim(),
  };
}
