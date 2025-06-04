// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import { motion, useAnimation } from 'framer-motion';
// import cardsData from '@/data/cardData.json';
// import Image from 'next/image';

// const CARD_WIDTH = 100;
// const CARD_MARGIN = 10;
// const STEP = CARD_WIDTH + CARD_MARGIN;

// type Card = { id: number; img: string; chance: number };

// function pickWinnerCardIndex(cards: Card[]): number {
//   const totalChance = cards.reduce((sum, card) => sum + card.chance, 0);
//   const rand = Math.random() * totalChance;

//   let accum = 0;
//   for (let i = 0; i < cards.length; i++) {
//     accum += cards[i].chance;
//     if (rand <= accum) return i;
//   }

//   return cards.length - 1;
// }

// export const Roulette = () => {
//   const controls = useAnimation();

//   const [cards] = useState<Card[]>(cardsData.cards);

//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const [winnersHistory, setWinnersHistory] = useState<Card[]>([]);

//   const getInitialWinStats = (cards: Card[]) => {
//     const uniqueImgs = Array.from(new Set(cards.map(card => card.img)));
//     return uniqueImgs.reduce((acc, img) => {
//       acc[img] = { img, count: 0 };
//       return acc;
//     }, {} as Record<string, { img: string; count: number }>);
//   };

//   const [winStats, setWinStats] = useState(() => getInitialWinStats(cards));
//   const cardsToRender = [...cards, ...cards];

//   const positionRef = useRef(0);
//   const speedRef = useRef(0);
//   const isRunningRef = useRef(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const totalLength = cards.length * STEP;

//   const centerNearestCard = async () => {
//     if (!containerRef.current) return;

//     const containerCenter = containerRef.current.offsetWidth / 2;
//     let pos = positionRef.current % totalLength;

//     if (pos < 0) pos += totalLength;

//     const cardCenters = cardsToRender.map((_, i) => i * STEP - pos + CARD_WIDTH / 2);

//     let nearestIndex = 0;
//     let minDistance = Infinity;

//     for (let i = 0; i < cardCenters.length; i++) {
//       const dist = Math.abs(cardCenters[i] - containerCenter);
//       if (dist < minDistance) {
//         minDistance = dist;
//         nearestIndex = i;
//       }
//     }

//     const desiredCenter = nearestIndex * STEP;
//     const newPosition = desiredCenter - (containerCenter - CARD_WIDTH / 2);

//     await controls.start({
//       x: -newPosition,
//       transition: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
//     });

//     positionRef.current = newPosition;

//     setActiveIndex(nearestIndex);

//     const winnerCard = cardsToRender[nearestIndex % cards.length];
//     console.log('Фактична Виграшна картка:', winnerCard);

//     setWinnersHistory(prev => {
//       const updated = [winnerCard, ...prev];
//       return updated.slice(0, 10);
//     });

//     setWinStats(prev => {
//       const key = winnerCard.img;

//       return {
//         ...prev,
//         [key]: {
//           img: key,
//           count: (prev[key]?.count || 0) + 1,
//         },
//       };
//     });

//     setTimeout(() => setActiveIndex(null), 1500);
//   };

//   const calculateDistanceToWinner = (winnerIndex: number): number => {
//     if (!containerRef.current) return 0;

//     const containerCenter = containerRef.current.offsetWidth / 2;
//     const visibleCardsOffset = cards.length;
//     const targetIndex = visibleCardsOffset + winnerIndex;

//     const targetCardCenter = targetIndex * STEP + CARD_WIDTH / 2;
//     const currentScroll = positionRef.current;
//     const currentCenter = currentScroll + containerCenter;

//     const distance = targetCardCenter - currentCenter + 3080;

//     return distance;
//   };

//   const accelerate = async (targetSpeed: number): Promise<number> => {
//     return new Promise(resolve => {
//       let traveled = 0;
//       let speed = 0;
//       const accel = 3000;

//       const step = () => {
//         const delta = 1 / 60;
//         speed = Math.min(speed + accel * delta, targetSpeed);
//         const move = speed * delta;
//         traveled += move;
//         speedRef.current = speed;

//         if (speed < targetSpeed) {
//           requestAnimationFrame(step);
//         } else {
//           resolve(traveled);
//         }
//       };

//       requestAnimationFrame(step);
//     });
//   };

//   const decelerate = (targetDistance: number): Promise<void> => {
//     return new Promise(resolve => {
//       const decel = 2000; // px/s^2
//       let traveled = 0;

//       const offsetError = (Math.random() - 0.5) * 60;
//       const adjustedDistance = targetDistance + offsetError;

//       let speed = Math.sqrt(2 * decel * adjustedDistance);
//       speedRef.current = speed;

//       const step = () => {
//         const delta = 1 / 60;

//         if ((traveled >= adjustedDistance && speed <= 0) || speed <= 0) {
//           isRunningRef.current = false;
//           resolve();
//           return;
//         }

//         const move = speed * delta;
//         traveled += move;

//         speed = Math.max(speed - decel * delta, 0);
//         speedRef.current = speed;

//         requestAnimationFrame(step);
//       };

//       requestAnimationFrame(step);
//     });
//   };

//   const startLoop = async () => {
//     isRunningRef.current = true;

//     const winnerIndex = pickWinnerCardIndex(cards);
//     console.log('Обрана виграшна картка:', cards[winnerIndex]);

//     const totalDistance = calculateDistanceToWinner(winnerIndex);

//     const maxSpeed = 2500;
//     const accelDistance = await accelerate(maxSpeed);
//     const remainingDistance = totalDistance - accelDistance;

//     await decelerate(remainingDistance);
//     await centerNearestCard();
//     await new Promise(r => setTimeout(r, 5000));
//     startLoop();
//   };

//   useEffect(() => {
//     let lastTimestamp: number | null = null;

//     const animate = (timestamp: number) => {
//       if (!lastTimestamp) lastTimestamp = timestamp;
//       const delta = (timestamp - lastTimestamp) / 1000;

//       if (isRunningRef.current) {
//         positionRef.current += speedRef.current * delta;

//         if (positionRef.current >= totalLength) {
//           positionRef.current -= totalLength;
//         }

//         controls.set({ x: -positionRef.current });
//       }

//       lastTimestamp = timestamp;
//       requestAnimationFrame(animate);
//     };

//     requestAnimationFrame(animate);
//     startLoop();

//     return () => {
//       isRunningRef.current = false;
//     };
//   }, [controls]);

//   return (
//     <div className="flex flex-col items-center">
//       <div className="flex w-[1280px] justify-between py-[32px]">
//         {/* 🔽 Історія виграшів */}
//         <div className="flex gap-2">
//           {winnersHistory.map((card, index) => (
//             <div key={`${card.id}-${index}`} className="w-[32px] h-[32px] overflow-hidden">
//               <Image
//                 src={card.img}
//                 alt={`Winner ${card.id}`}
//                 width={32}
//                 height={32}
//                 className="w-full h-full"
//               />
//             </div>
//           ))}
//         </div>

//         {/* 🔽 Статистика виграшів */}
//         <div className="flex flex-wrap gap-4 justify-center">
//           {Object.values(winStats).map(({ img, count }) => (
//             <div key={img} className="flex items-center gap-[8px]">
//               <Image src={img} alt="stat" width={32} height={32} className="w-[32px] h-[32px]" />
//               <span className="text-[14px] text-center w-[20px] text-white font-medium">
//                 {count}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 🔽 Рулетка */}
//       <div
//         ref={containerRef}
//         className="roulette-container mx-auto w-[1280px] relative overflow-hidden"
//         style={{
//           height: 200,
//         }}
//       >
//         <motion.div animate={controls} className="flex mt-[50px] gap-[10px]">
//           {cardsToRender.map((card, index) => (
//             <motion.div
//               key={index}
//               animate={{ scale: activeIndex === index ? 1.5 : 1 }}
//               transition={{ type: 'spring', stiffness: 200, damping: 15 }}
//               className="min-w-[100px] h-[100px] rounded-xl flex items-center justify-center shadow-[0_0_8px_#1c7ed6] select-none"
//             >
//               <Image
//                 src={card.img}
//                 alt={`Card ${card.id}`}
//                 width={100}
//                 height={100}
//                 className="w-[100px] h-[100px]"
//               />
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </div>
//   );
// };

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';

import { WinStats } from '../WinStats/WinStats';
import { WinnerHistory } from '../WinnerHistory/WinnerHistory';

import { pickWinnerCardIndex } from '@/utils/pickWinner';
import { getInitialWinStats } from '@/utils/stats';

import cardsData from '@/data/cardData.json';

import { Card } from './types';

const CARD_WIDTH = 100;
const CARD_MARGIN = 10;
const STEP = CARD_WIDTH + CARD_MARGIN;

export const Roulette = () => {
  const controls = useAnimation();
  const [cards] = useState<Card[]>(cardsData.cards);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [winnersHistory, setWinnersHistory] = useState<Card[]>([]);
  const [winStats, setWinStats] = useState(() => getInitialWinStats(cards));

  const cardsToRender = [...cards, ...cards];
  const positionRef = useRef(0);
  const speedRef = useRef(0);
  const isRunningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalLength = cards.length * STEP;

  const centerNearestCard = async () => {
    if (!containerRef.current) return;
    const containerCenter = containerRef.current.offsetWidth / 2;
    let pos = positionRef.current % totalLength;
    if (pos < 0) pos += totalLength;

    const cardCenters = cardsToRender.map((_, i) => i * STEP - pos + CARD_WIDTH / 2);

    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < cardCenters.length; i++) {
      const dist = Math.abs(cardCenters[i] - containerCenter);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const desiredCenter = nearestIndex * STEP;
    const newPosition = desiredCenter - (containerCenter - CARD_WIDTH / 2);

    await controls.start({
      x: -newPosition,
      transition: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
    });

    positionRef.current = newPosition;
    setActiveIndex(nearestIndex);

    const winnerCard = cardsToRender[nearestIndex % cards.length];

    setWinnersHistory(prev => [winnerCard, ...prev].slice(0, 10));

    setWinStats(prev => ({
      ...prev,
      [winnerCard.img]: {
        img: winnerCard.img,
        count: (prev[winnerCard.img]?.count || 0) + 1,
      },
    }));

    setTimeout(() => setActiveIndex(null), 1500);
  };

  const calculateDistanceToWinner = (winnerIndex: number): number => {
    if (!containerRef.current) return 0;
    const containerCenter = containerRef.current.offsetWidth / 2;
    const visibleCardsOffset = cards.length;
    const targetIndex = visibleCardsOffset + winnerIndex;

    const targetCardCenter = targetIndex * STEP + CARD_WIDTH / 2;
    const currentScroll = positionRef.current;
    const currentCenter = currentScroll + containerCenter;
    const distance = targetCardCenter - currentCenter + 3080;

    return distance;
  };

  const accelerate = async (targetSpeed: number): Promise<number> => {
    return new Promise(resolve => {
      let traveled = 0;
      let speed = 0;
      const accel = 3000;

      const step = () => {
        const delta = 1 / 60;
        speed = Math.min(speed + accel * delta, targetSpeed);
        const move = speed * delta;
        traveled += move;
        speedRef.current = speed;

        if (speed < targetSpeed) {
          requestAnimationFrame(step);
        } else {
          resolve(traveled);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const decelerate = (targetDistance: number): Promise<void> => {
    return new Promise(resolve => {
      const decel = 2000;
      let traveled = 0;
      const offsetError = (Math.random() - 0.5) * 60;
      const adjustedDistance = targetDistance + offsetError;

      let speed = Math.sqrt(2 * decel * adjustedDistance);
      speedRef.current = speed;

      const step = () => {
        const delta = 1 / 60;
        if ((traveled >= adjustedDistance && speed <= 0) || speed <= 0) {
          isRunningRef.current = false;
          resolve();
          return;
        }

        const move = speed * delta;
        traveled += move;
        speed = Math.max(speed - decel * delta, 0);
        speedRef.current = speed;

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  };

  const startLoop = async () => {
    isRunningRef.current = true;
    const winnerIndex = pickWinnerCardIndex(cards);
    const totalDistance = calculateDistanceToWinner(winnerIndex);

    const maxSpeed = 2500;
    const accelDistance = await accelerate(maxSpeed);
    const remainingDistance = totalDistance - accelDistance;

    await decelerate(remainingDistance);
    await centerNearestCard();
    await new Promise(r => setTimeout(r, 5000));
    startLoop();
  };

  useEffect(() => {
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;

      if (isRunningRef.current) {
        positionRef.current += speedRef.current * delta;

        if (positionRef.current >= totalLength) {
          positionRef.current -= totalLength;
        }

        controls.set({ x: -positionRef.current });
      }

      lastTimestamp = timestamp;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    startLoop();

    return () => {
      isRunningRef.current = false;
    };
  }, [controls]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-[1280px] justify-between py-[32px]">
        <WinnerHistory winners={winnersHistory} />
        <WinStats stats={winStats} />
      </div>

      <div
        ref={containerRef}
        className="roulette-container mx-auto w-[1280px] relative overflow-hidden"
        style={{ height: 200 }}
      >
        <motion.div animate={controls} className="flex mt-[50px] gap-[10px]">
          {cardsToRender.map((card, index) => (
            <motion.div
              key={index}
              animate={{ scale: activeIndex === index ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="min-w-[100px] h-[100px] rounded-xl flex items-center justify-center shadow-[0_0_8px_#1c7ed6] select-none"
            >
              <Image
                src={card.img}
                alt={`Card ${card.id}`}
                width={100}
                height={100}
                className="w-[100px] h-[100px]"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
