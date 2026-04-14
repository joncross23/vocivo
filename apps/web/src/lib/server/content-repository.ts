import { join } from 'node:path';
import { createCsvContentRepository } from '@vocivo/infrastructure';

const csvFilePath = join(process.cwd(), 'data/raw/knowt_flashcards_translations_full.csv');

const contentRepository = createCsvContentRepository({ csvFilePath });

export function getContentRepository() {
  return contentRepository;
}
