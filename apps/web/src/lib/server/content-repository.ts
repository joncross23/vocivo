import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createCsvContentRepository } from '@vocivo/infrastructure';

const csvFilePath = resolveCsvFilePath();

const contentRepository = createCsvContentRepository({ csvFilePath });

export function getContentRepository() {
  return contentRepository;
}

function resolveCsvFilePath(): string {
  let currentDirectory = process.cwd();

  while (true) {
    const candidate = join(currentDirectory, 'data/raw/knowt_flashcards_translations_full.csv');

    if (existsSync(candidate)) {
      return candidate;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  throw new Error(
    `Could not locate knowt_flashcards_translations_full.csv from ${process.cwd()}`,
  );
}
