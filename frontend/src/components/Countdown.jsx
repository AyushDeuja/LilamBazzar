import { useEffect, useState } from 'react';

function remaining(target) {
  return Math.max(0, new Date(target).getTime() - Date.now());
}

function split(ms) {
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

/**
 * Live ticking countdown to `target` (ISO string/Date).
 * Calls `onEnd` once when it reaches zero.
 */
export default function Countdown({ target, onEnd }) {
  const [ms, setMs] = useState(() => remaining(target));

  useEffect(() => {
    setMs(remaining(target));
    const timer = setInterval(() => {
      const left = remaining(target);
      setMs(left);
      if (left <= 0) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);
    return () => clearInterval(timer);
    // onEnd is intentionally not a dependency: parents pass inline callbacks
    // and re-subscribing every render would reset the interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const { days, hours, minutes, seconds } = split(ms);
  const pad = (n) => String(n).padStart(2, '0');

  const cells = [
    { value: days, label: 'days' },
    { value: hours, label: 'hrs' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'sec' },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Time remaining">
      {cells.map((cell) => (
        <div className="countdown__cell" key={cell.label}>
          <strong>{pad(cell.value)}</strong>
          <span>{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
