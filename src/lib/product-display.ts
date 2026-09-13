export function mockRating(productId: string): { score: number; count: number } {
  let hash = 0;
  for (let i = 0; i < productId.length; i += 1) {
    hash = (hash + productId.charCodeAt(i) * (i + 1)) % 997;
  }

  const score = 3.5 + (hash % 15) / 10;
  const count = 50 + (hash % 950);

  return {
    score: Math.round(score * 10) / 10,
    count,
  };
}

export function renderStarRating(score: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(score)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}
