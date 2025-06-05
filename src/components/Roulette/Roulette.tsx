'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

import { WinStats } from '@/components/WinStats';
import { WinnerHistory } from '@/components/WinnerHistory';
import { WinnerDisplay } from '@/components/TestWinnerDisplay';
import { RouletteCard } from '@/components/RouletteCard';

import {
  pickWinnerCardIndex,
  getInitialWinStats,
  calculateDistanceToWinner,
  accelerate,
  decelerate,
  startCountdown,
} from '@/utils';

import cardsData from '@/data/cardData.json';
import common from '@/data/common.json';

import { Card } from './types';

const CARD_WIDTH = 100;
const CARD_MARGIN = 10;
const STEP = CARD_WIDTH + CARD_MARGIN;

export const Roulette = () => {
  const { rolling } = common;

  const controls = useAnimation();
  const [cards] = useState<Card[]>(cardsData.cards);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [winnersHistory, setWinnersHistory] = useState<Card[]>([]);
  const [winStats, setWinStats] = useState(() => getInitialWinStats(cards));
  const [selectedWinner, setSelectedWinner] = useState<Card | null>(null);
  const [actualWinner, setActualWinner] = useState<Card | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const cardsToRender = [...cards, ...cards];
  const positionRef = useRef(0);
  const speedRef = useRef(0);
  const isRunningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRunRef = useRef(true);

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
    setActualWinner(winnerCard);
    setWinnersHistory(prev => [winnerCard, ...prev].slice(0, 10));
    setWinStats(prev => ({
      ...prev,
      [winnerCard.img]: {
        img: winnerCard.img,
        count: (prev[winnerCard.img]?.count || 0) + 1,
      },
    }));

    setTimeout(() => {
      setActiveIndex(null);

      setTimeout(() => {
        startCountdown(10, setCountdown, startLoop); // в перший параметр передаємо інтервал між обертаннями
      }, 1000);
    }, 1500);
  };

  const startLoop = async () => {
    isRunningRef.current = true;
    const winnerIndex = pickWinnerCardIndex(cards);
    setSelectedWinner(cards[winnerIndex]);

    const totalDistance = calculateDistanceToWinner(containerRef, cards, winnerIndex, positionRef);

    const maxSpeed = 2500;
    const accelDistance = await accelerate(speedRef, maxSpeed);

    const remainingDistance = totalDistance - accelDistance;

    await decelerate(remainingDistance, speedRef, isFirstRunRef.current);

    isFirstRunRef.current = false;

    await centerNearestCard();
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
    <div className="flex flex-col items-center relative">
      <div className="flex xl:flex-row flex-col w-[300px] md:w-[700px] xl:w-[1280px] gap-[20px] xl:gap-0 justify-center xl:justify-between py-[32px]">
        <WinnerHistory winners={winnersHistory} />
        <WinStats stats={winStats} />
      </div>

      <div
        ref={containerRef}
        className="roulette-container mx-auto w-[300px] md:w-[700px] xl:w-[1280px] relative overflow-hidden"
        style={{ height: 200 }}
      >
        {/* Стрілка по центру */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-red-600" />
        </div>

        {/* Таймер зверху поверх карток */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute text-center w-[100px] h-[100px] top-[50px] left-1/2 -translate-x-1/2 text-white z-20 bg-black/60 px-[8px] py-[26px] select-none">
            <p className="text-[14px] leading-[1.42]">{rolling}</p>
            <p className="text-[20px] leading-[1.4] font-bold">{countdown.toFixed(2)}</p>
          </div>
        )}

        <motion.div animate={controls} className="flex mt-[50px] gap-[10px]">
          {cardsToRender.map((card, index) => {
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;

            return <RouletteCard key={index} card={card} isActive={isActive} isDimmed={isDimmed} />;
          })}
        </motion.div>
      </div>

      {/* Відображення обраної і фактичної виграшної картки */}
      <WinnerDisplay selectedWinner={selectedWinner} actualWinner={actualWinner} />
    </div>
  );
};
