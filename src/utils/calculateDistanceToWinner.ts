import { Card } from '@/components/Roulette/types';

const CARD_WIDTH = 100;
const CARD_MARGIN = 10;
const STEP = CARD_WIDTH + CARD_MARGIN;

export const calculateDistanceToWinner = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  cards: Card[],
  winnerIndex: number,
  positionRef: React.MutableRefObject<number>
): number => {
  if (!containerRef.current) return 0;

  const containerCenter = containerRef.current.offsetWidth / 2;
  const visibleCardsOffset = cards.length;
  const targetIndex = visibleCardsOffset + winnerIndex;

  const targetCardCenter = targetIndex * STEP + CARD_WIDTH / 2;
  const currentScroll = positionRef.current;
  const currentCenter = currentScroll + containerCenter;

  const distance = targetCardCenter - currentCenter + 6160;

  return distance;
};
