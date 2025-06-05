import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/Roulette/types';

interface Props {
  card: Card;
  isActive: boolean;
  isDimmed: boolean;
}

export const RouletteCard = ({ card, isActive, isDimmed }: Props) => (
  <motion.div
    animate={{ scale: isActive ? 1.2 : 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    className="min-w-[100px] h-[100px] rounded-xl flex items-center justify-center select-none"
    style={{
      filter: isDimmed ? 'brightness(0.5)' : 'none',
      zIndex: isActive ? 10 : 1,
      position: 'relative',
      transition: 'filter 0.3s ease',
    }}
  >
    <Image
      src={card.img}
      alt={`Card ${card.id}`}
      width={100}
      height={100}
      className="w-[100px] h-[100px]"
    />
  </motion.div>
);
