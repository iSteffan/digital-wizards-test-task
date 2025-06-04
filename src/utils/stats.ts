import { Card } from '@/components/Roulette/types';

export const getInitialWinStats = (cards: Card[]) => {
  const uniqueImgs = Array.from(new Set(cards.map(card => card.img)));
  return uniqueImgs.reduce((acc, img) => {
    acc[img] = { img, count: 0 };
    return acc;
  }, {} as Record<string, { img: string; count: number }>);
};
