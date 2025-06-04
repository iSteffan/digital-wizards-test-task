import Image from 'next/image';

type Props = {
  stats: Record<string, { img: string; count: number }>;
};

export const WinStats = ({ stats }: Props) => (
  <div className="flex flex-wrap gap-[4px] md:gap-4 justify-center">
    {Object.values(stats).map(({ img, count }) => (
      <div key={img} className="flex items-center gap-[8px]">
        <Image src={img} alt="stat" width={32} height={32} className="stat-card-responsive" />
        <span className="text-[14px] text-center w-[20px] text-white font-medium">{count}</span>
      </div>
    ))}
  </div>
);
