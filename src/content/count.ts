const WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

export function countWord(n: number): string {
  return WORDS[n - 1] ?? String(n)
}
