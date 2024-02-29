import { Duration } from "date-fns";

export const secondsToCountdownString = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes < 10 ? `0${minutes}` : minutes}m ${
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
  }s`;
};

export const durationToString = (duration: Duration) => {
  const firstNonZeroValueIndex = Object.values(duration).findIndex(
    (value) => value > 0
  );
  const durationKeys = [
    Object.keys(duration)[firstNonZeroValueIndex],
    Object.keys(duration)[firstNonZeroValueIndex + 1],
  ];

  return durationKeys.reduce((acc, key) => {
    if (key) {
      return `${acc ? `${acc} ` : ""}${duration[key as keyof typeof duration]}${
        key[0]
      }`;
    }

    return acc;
  }, "");
};
