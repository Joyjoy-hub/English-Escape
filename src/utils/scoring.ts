export function starRating(hintCount: number, mistakeCount: number): 1 | 2 | 3 {
  const total = hintCount + mistakeCount
  if (total <= 2) return 3
  if (total <= 5) return 2
  return 1
}
