import { Card } from '@/components/Roulette/types';

export function pickWinnerCardIndex(cards: Card[]): number {
  const totalChance = cards.reduce((sum, card) => sum + card.chance, 0);
  const rand = Math.random() * totalChance;

  let accum = 0;
  for (let i = 0; i < cards.length; i++) {
    accum += cards[i].chance;
    if (rand <= accum) return i;
  }

  return cards.length - 1;
}
