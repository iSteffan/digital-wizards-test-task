import Image from 'next/image';
import { Card } from '@/components/Roulette/types';

type Props = { winners: Card[] };

export const WinnerHistory = ({ winners }: Props) => (
  <div className="flex gap-2">
    {winners.map((card, index) => (
      <div key={`${card.id}-${index}`} className="w-[32px] h-[32px] overflow-hidden">
        <Image
          src={card.img}
          alt={`Winner ${card.id}`}
          width={32}
          height={32}
          className="w-full h-full"
        />
      </div>
    ))}
  </div>
);
