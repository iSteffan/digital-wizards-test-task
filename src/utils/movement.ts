export const accelerate = (speedRef: { current: number }, targetSpeed: number): Promise<number> => {
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

export const decelerate = (
  targetDistance: number,
  speedRef: { current: number },
  firstRun: boolean
): Promise<void> => {
  return new Promise(resolve => {
    const decel = 2000;
    let traveled = 0;

    let adjustedDistance: number;
    if (firstRun) {
      adjustedDistance = targetDistance - 40;
    } else {
      const offsetError = -30 + Math.random() * 60; // [-30...+30]
      adjustedDistance = targetDistance + offsetError;
    }

    let speed = Math.sqrt(2 * decel * adjustedDistance);
    speedRef.current = speed;

    const step = () => {
      const delta = 1 / 60;
      if ((traveled >= adjustedDistance && speed <= 0) || speed <= 0) {
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
