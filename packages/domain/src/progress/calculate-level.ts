export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100));
}
