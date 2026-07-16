import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ProgressRing({ value, size = 100, label, sublabel }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: size, height: size, margin: '0 auto' }}>
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            textSize: '1.4rem',
            pathColor: 'rgba(255,255,255,0.9)',
            textColor: 'white',
            trailColor: 'rgba(255,255,255,0.2)',
            pathTransitionDuration: 0.8,
          })}
        />
      </div>
      {label && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', marginTop: '0.5rem', fontWeight: 500 }}>{label}</p>}
      {sublabel && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{sublabel}</p>}
    </div>
  );
}
