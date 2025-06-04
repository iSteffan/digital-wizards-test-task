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

  const [cards] = useState<Card[]>(cardsData.cards);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    console.log('Фактична Виграшна картка:', winnerCard);

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

    console.log('Поточна позиція:', currentScroll.toFixed(2));
    console.log('Центр контейнера:', containerCenter.toFixed(2));
    console.log('Центр виграшної картки:', targetCardCenter.toFixed(2));
    console.log('Відстань до виграшної картки:', distance.toFixed(2));

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
          console.log('Accelerate phase complete. Traveled:', traveled.toFixed(2), 'px');
          resolve(traveled);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const decelerate = (targetDistance: number): Promise<void> => {
    return new Promise(resolve => {
      const decel = 2000; // px/s^2
      let traveled = 0;

      let speed = Math.sqrt(2 * decel * targetDistance);
      speedRef.current = speed;

      const step = () => {
        const delta = 1 / 60;

        if (traveled >= targetDistance || speed <= 0) {
          isRunningRef.current = false;
          console.log('Decelerate phase complete. Traveled:', traveled.toFixed(2), 'px');
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
    console.log('Обрана виграшна картка:', cards[winnerIndex]);

    const totalDistance = calculateDistanceToWinner(winnerIndex);

    const maxSpeed = 2500;
    const accelDistance = await accelerate(maxSpeed);
    const remainingDistance = totalDistance - accelDistance;

    console.log('Очікувана повна відстань:', totalDistance.toFixed(2));
    console.log('Прискорення пройшло:', accelDistance.toFixed(2));
    console.log('Гальмування має пройти:', remainingDistance.toFixed(2));

    await decelerate(remainingDistance);
    await centerNearestCard();
    await new Promise(r => setTimeout(r, 15000));
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
      style={{
        height: 200,
      }}
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
