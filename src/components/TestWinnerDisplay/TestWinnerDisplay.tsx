import React from 'react';
import Image from 'next/image';
import { Card } from '../Roulette/types';

interface WinnerDisplayProps {
  selectedWinner: Card | null;
  actualWinner: Card | null;
}

export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ selectedWinner, actualWinner }) => {
  return (
    <div className="mt-6 flex w-[300px] justify-between md:w-[700px]">
      <div className="w-[140px] md:w-[270px] xl:w-[270px]">
        <p className="text-responsive text-blue-600">Прогнозований переможець</p>
        <div className="flex justify-between">
          <p className="text-responsive">ID {selectedWinner?.id}</p>
          <p className="text-responsive">
            Win rate: {selectedWinner ? selectedWinner.chance.toFixed(2) : '—'}%
          </p>
        </div>

        {selectedWinner && (
          <Image
            src={selectedWinner.img}
            alt={`Card ${selectedWinner.id}`}
            width={32}
            height={32}
            className="stat-card-responsive"
          />
        )}
      </div>

      <div>
        <p className="text-green-600 text-responsive">Фактичний переможець</p>
        <p className="text-responsive">ID {actualWinner?.id}</p>
        {actualWinner && (
          <Image
            src={actualWinner.img}
            alt={`Card ${actualWinner.id}`}
            width={32}
            height={32}
            className="stat-card-responsive"
          />
        )}
      </div>
    </div>
  );
};
