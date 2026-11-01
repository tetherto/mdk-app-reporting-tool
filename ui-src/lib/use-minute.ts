import { useEffect, useState } from "react";

export const MINUTE = 60_000;

const nextMinute = (): number => Math.ceil(Date.now() / MINUTE) * MINUTE;

/** Now, rounded up to the minute, and updated every minute: for a window that rolls with the clock. */
export const useMinute = (): number => {
  const [now, setNow] = useState(nextMinute);
  useEffect(() => {
    const id = setInterval(() => setNow(nextMinute()), MINUTE);
    return () => clearInterval(id);
  }, []);
  return now;
};
