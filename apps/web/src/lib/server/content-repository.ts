import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createCsvContentRepository } from '@vocivo/infrastructure';

const csvFilePath = resolveCsvFilePath();

const contentRepository = createCsvContentRepository({ csvFilePath });

export function getContentRepository() {
  return contentRepository;
}

function resolveCsvFilePath(): string {
  let currentDirectory: string | null = process.cwd();

  while (currentDirectory !== null) {
    const candidate = join(currentDirectory, 'data/raw/knowt_flashcards_translations_full.csv');

    if (existsSync(candidate)) {
      return candidate;
    }

    const parentDirectory = dirname(currentDirectory);

    currentDirectory = parentDirectory === currentDirectory ? null : parentDirectory;
  }

  throw new Error(
    `Could not locate knowt_flashcards_translations_full.csv from ${process.cwd()}`,
  );
}
