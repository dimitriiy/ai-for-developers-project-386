import { CountdownWidget } from '@/widgets/countdown';
import './styles.css';

export const CountdownPage = () => {
  // Set target date to 7 days from now for demonstration
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);

  return (
    <div className="countdown-page">
      <div className="countdown-page-content">
        <h1 className="countdown-page-title">Event Countdown</h1>
        <p className="countdown-page-description">
          Time remaining until the big event!
        </p>
        <CountdownWidget
          targetDate={targetDate}
          title="Time Remaining"
        />
      </div>
    </div>
  );
};
