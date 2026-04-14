import type { ContentEntry } from '@vocivo/contracts';

export interface ContentTheme {
  id: string;
  title: string;
  totalItems: number;
}

export interface ContentCategory {
  id: string;
  title: string;
  themeId: string;
  totalItems: number;
}

export interface ContentGrammarType {
  id: string;
  title: string;
  totalItems: number;
}

export interface ContentSourceDeck {
  id: string;
  title: string;
  themeId: string;
  categoryId: string;
  grammarTypeId: string;
  totalItems: number;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ContentCatalogueEntry extends ContentEntry {
  sourceItemId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceThemeLabel: string;
  sourceCategoryLabel: string;
  sourceGrammarTypeLabel: string;
  cardIndexInDeck: number | null;
  spanishAudioUrl: string | null;
  englishAudioUrl: string | null;
}

export interface ContentCatalogue {
  entries: ContentCatalogueEntry[];
  themes: ContentTheme[];
  categories: ContentCategory[];
  grammarTypes: ContentGrammarType[];
  sourceDecks: ContentSourceDeck[];
}
