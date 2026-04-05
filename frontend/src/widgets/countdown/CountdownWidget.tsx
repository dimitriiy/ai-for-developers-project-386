import { useState, useEffect, useCallback } from 'react';
import './styles.css';

interface CountdownWidgetProps {
  targetDate: Date;
  title?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const formatNumber = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const CountdownWidget = ({ targetDate, title = 'Countdown' }: CountdownWidgetProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [isExpired, setIsExpired] = useState(false);

  const updateTimer = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(targetDate);
    setTimeLeft(newTimeLeft);

    const isDone =
      newTimeLeft.days === 0 &&
      newTimeLeft.hours === 0 &&
      newTimeLeft.minutes === 0 &&
      newTimeLeft.seconds === 0;

    if (isDone && !isExpired) {
      setIsExpired(true);
    }
  }, [targetDate, isExpired]);

  useEffect(() => {
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [updateTimer]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="countdown-widget">
      <h2 className="countdown-title">{title}</h2>
      {isExpired ? (
        <div className="countdown-expired">Time is up!</div>
      ) : (
        <div className="countdown-container">
          {timeUnits.map((unit) => (
            <div key={unit.label} className="countdown-unit">
              <span className="countdown-value">{formatNumber(unit.value)}</span>
              <span className="countdown-label">{unit.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
