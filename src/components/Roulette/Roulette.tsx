// -----------------------------------------------------------------картка вірна але анімація дотягує до неї повільно
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import cardsData from '@/data/cardData.json';
import Image from 'next/image';

const CARD_WIDTH = 100;
const CARD_MARGIN = 10;
const STEP = CARD_WIDTH + CARD_MARGIN;

type Card = { id: number; img: string; chance: number };

function pickWinnerCardIndex(cards: Card[]): number {
  const totalChance = cards.reduce((sum, card) => sum + card.chance, 0);
  const rand = Math.random() * totalChance;

  let accum = 0;
  for (let i = 0; i < cards.length; i++) {
    accum += cards[i].chance;
    if (rand <= accum) return i;
  }

  return cards.length - 1;
}

export default function Roulette() {
  const controls = useAnimation();
  const [cards] = useState<Card[]>(cardsData.cards.map((card, i) => ({ ...card, id: i })));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const cardsToRender = [...cards, ...cards, ...cards]; // тричі для буфера
  const totalLength = cards.length * STEP;

  const positionRef = useRef(0);
  const speedRef = useRef(0);
  const isRunningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const winnerIndexRef = useRef<number>(0);

  const animateToWinner = async (winnerIndex: number) => {
    if (!containerRef.current) return;

    const containerCenter = containerRef.current.offsetWidth / 2;
    const visibleCardsOffset = Math.floor(cardsToRender.length / 3);

    const targetIndex = visibleCardsOffset + winnerIndex;
    const desiredCenter = targetIndex * STEP;
    const finalPosition = desiredCenter - (containerCenter - CARD_WIDTH / 2);

    await controls.start({
      x: -finalPosition,
      transition: { duration: 2, ease: 'easeOut' },
    });

    positionRef.current = finalPosition;

    const actualCenterIndex = Math.round((finalPosition + containerCenter - CARD_WIDTH / 2) / STEP);
    const actualCard = cardsToRender[actualCenterIndex];
    const actualCardIndexInOriginal = actualCard.id;

    const distance = Math.abs(actualCardIndexInOriginal - winnerIndex);
    console.log('Відстань між фактичною центральною карткою та виграшною:', distance);
    console.log('Фактична центральна картка:', actualCard);
    console.log('Очікувана виграшна картка:', cards[winnerIndex]);

    setActiveIndex(actualCenterIndex);
    setTimeout(() => setActiveIndex(null), 1500);
  };

  const accelerate = () =>
    new Promise<void>(res => {
      let start: number | null = null;
      const anim = (time: number) => {
        if (!start) start = time;
        const elapsed = (time - start) / 1000;
        speedRef.current = elapsed < 2 ? 3000 * (elapsed / 2) : 3000;
        if (elapsed < 2) requestAnimationFrame(anim);
        else res();
      };
      requestAnimationFrame(anim);
    });

  const decelerate = () =>
    new Promise<void>(res => {
      let start: number | null = null;
      const anim = (time: number) => {
        if (!start) start = time;
        const elapsed = (time - start) / 1000;
        speedRef.current = elapsed < 4 ? 3000 * (1 - elapsed / 4) : 0;
        if (elapsed < 4) requestAnimationFrame(anim);
        else {
          isRunningRef.current = false;
          res();
        }
      };
      requestAnimationFrame(anim);
    });

  const startLoop = async () => {
    isRunningRef.current = true;
    const winnerIndex = pickWinnerCardIndex(cards);
    winnerIndexRef.current = winnerIndex;

    console.log('Обрана виграшна картка:', cards[winnerIndex]);

    await accelerate();
    await new Promise(r => setTimeout(r, 2000));
    await decelerate();
    await animateToWinner(winnerIndex);

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
  );
}
