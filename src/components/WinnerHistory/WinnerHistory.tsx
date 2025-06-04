// import Image from 'next/image';
// import { Card } from '@/components/Roulette/types';

// type Props = { winners: Card[] };

// export const WinnerHistory = ({ winners }: Props) => (
//   <div className="flex gap-2 justify-center xl:justify-start">
//     {winners.map((card, index) => (
//       <div key={`${card.id}-${index}`} className="w-[32px] h-[32px] overflow-hidden">
//         <Image
//           src={card.img}
//           alt={`Winner ${card.id}`}
//           width={32}
//           height={32}
//           className="w-full h-full"
//         />
//       </div>
//     ))}
//   </div>
// );

import Image from 'next/image';
import { Card } from '@/components/Roulette/types';

type Props = { winners: Card[] };

export const WinnerHistory = ({ winners }: Props) => (
  <div className="flex gap-1 md:gap-2 justify-center h-[20px] md:h-[32px] xl:justify-start">
    {winners.length > 0 ? (
      winners.map((card, index) => (
        <div key={`${card.id}-${index}`} className="w-[32px] h-[32px] overflow-hidden">
          <Image
            src={card.img}
            alt={`Winner ${card.id}`}
            width={32}
            height={32}
            className="stat-card-responsive"
          />
        </div>
      ))
    ) : (
      <div className="w-[32px] h-[32px] opacity-0" />
    )}
  </div>
);
