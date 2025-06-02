'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const CARD_WIDTH = 100;
const CARD_MARGIN = 10;
const VISIBLE_CARDS = 11;
const TOTAL_CARDS = 30;
const STEP = CARD_WIDTH + CARD_MARGIN;

type Card = {
  id: number;
  label: number;
};

export default function Roulette() {
  const controls = useAnimation();
  const [cards, setCards] = useState<Card[]>(
    Array.from({ length: TOTAL_CARDS }, (_, i) => ({ id: i, label: i + 1 }))
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const positionRef = useRef(0);
  const speedRef = useRef(0);
  const isRunningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const centerNearestCard = async () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerCenter = containerWidth / 2;
    const pos = positionRef.current;

    const cardPositions = cards.map((_, index) => index * STEP - pos);

    let nearestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < cardPositions.length; i++) {
      const cardCenter = cardPositions[i] + CARD_WIDTH / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    const desiredCardCenterPos = nearestIndex * STEP;
    const newPosition = desiredCardCenterPos - (containerCenter - CARD_WIDTH / 2);

    await controls.start({
      x: -newPosition,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 20,
        mass: 1,
      },
    });

    positionRef.current = newPosition;

    const cardsShifted = Math.floor(newPosition / STEP);
    if (cardsShifted > 0) {
      setCards(prev => {
        const shift = cardsShifted % TOTAL_CARDS;
        return [...prev.slice(shift), ...prev.slice(0, shift)];
      });
      positionRef.current = newPosition - cardsShifted * STEP;
      controls.set({ x: -positionRef.current });
    }

    setActiveIndex(nearestIndex);
    setTimeout(() => setActiveIndex(null), 1500);
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;

      if (isRunningRef.current) {
        positionRef.current += speedRef.current * delta;

        if (positionRef.current >= STEP) {
          positionRef.current -= STEP;
          setCards(prev => {
            const first = prev[0];
            return [...prev.slice(1), first];
          });
        }
        controls.set({ x: -positionRef.current });
      }

      lastTimestamp = timestamp;
      animationFrameId = requestAnimationFrame(animate);
    };

    const runAnimation = async () => {
      isRunningRef.current = true;

      await new Promise<void>(res => {
        let start: number | null = null;
        const accelAnim = (time: number) => {
          if (!start) start = time;
          const elapsed = (time - start) / 1000;
          if (elapsed < 3) {
            speedRef.current = 2500 * (elapsed / 3);
            requestAnimationFrame(accelAnim);
          } else {
            speedRef.current = 2500;
            res();
          }
        };
        requestAnimationFrame(accelAnim);
      });

      await new Promise(r => setTimeout(r, 2000));

      await new Promise<void>(res => {
        let start: number | null = null;
        const decelAnim = (time: number) => {
          if (!start) start = time;
          const elapsed = (time - start) / 1000;
          if (elapsed < 5) {
            speedRef.current = 1500 * (1 - elapsed / 5);
            requestAnimationFrame(decelAnim);
          } else {
            speedRef.current = 0;
            isRunningRef.current = false;
            res();
          }
        };
        requestAnimationFrame(decelAnim);
      });

      await centerNearestCard();

      await new Promise(r => setTimeout(r, 5000));
      runAnimation();
    };

    animationFrameId = requestAnimationFrame(animate);
    runAnimation();

    return () => cancelAnimationFrame(animationFrameId);
  }, [controls]);

  const BUFFER = 3;
  const visibleCards = cards.slice(0, VISIBLE_CARDS + BUFFER * 2);

  return (
    <div
      ref={containerRef}
      className="mx-auto mt-24 relative overflow-hidden"
      style={{
        width: STEP * VISIBLE_CARDS - CARD_MARGIN,
        height: 200,
      }}
    >
      <motion.div animate={controls} className="flex mt-[50px] gap-[10px]">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card.id}
            animate={{
              scale: activeIndex === index ? 1.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="min-w-[100px] h-[100px] bg-blue-600 rounded-xl text-white font-bold text-[28px] flex items-center justify-center shadow-[0_0_8px_#1c7ed6] select-none"
          >
            {card.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
