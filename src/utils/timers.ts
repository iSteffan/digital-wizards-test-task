export const startCountdown = (
  duration: number,
  onTick: (remainingSec: number) => void,
  onComplete: () => void
) => {
  const end = performance.now() + duration * 1000;

  const updateCountdown = () => {
    const now = performance.now();
    const remainingSec = (end - now) / 1000;

    if (remainingSec > 0) {
      onTick(parseFloat(remainingSec.toFixed(2)));
      requestAnimationFrame(updateCountdown);
    } else {
      onTick(0);
      onComplete();
    }
  };

  requestAnimationFrame(updateCountdown);
};
