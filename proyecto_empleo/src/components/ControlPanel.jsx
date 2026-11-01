import { useMemo } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import CONFIG from '../config';

/**
 * Panel de controles — sliders e inputs interactivos
 */
export default function ControlPanel({ inputs, onChange, onReset }) {
  const keys = useMemo(() => Object.keys(CONFIG.defaults), []);

  const handleSliderChange = (key, value) => {
    onChange({ ...inputs, [key]: parseFloat(value) });
  };

  return (
    <aside className="control-panel animate-in">
      <h2 className="control-panel__title">
        <SlidersHorizontal size={15} />
        Panel de Control
      </h2>

      {keys.map((key) => {
        const range = CONFIG.sliderRanges[key];
        const label = CONFIG.labels[key];
        const prefix = CONFIG.prefixes[key] || '';
        const suffix = CONFIG.suffixes[key] || '';
        const value = inputs[key];
        const progress = ((value - range.min) / (range.max - range.min)) * 100;

        return (
          <div key={key} className="slider-group">
            <div className="slider-group__header">
              <label className="slider-group__label" htmlFor={`slider-${key}`}>
                {label}
              </label>
              <span className="slider-group__value">
                {prefix}
                {typeof value === 'number' && value % 1 !== 0
                  ? value.toFixed(3)
                  : value.toLocaleString()}
                {suffix}
              </span>
            </div>
            <input
              type="range"
              id={`slider-${key}`}
              min={range.min}
              max={range.max}
              step={range.step}
              value={value}
              onChange={(e) => handleSliderChange(key, e.target.value)}
              style={{ '--slider-progress': `${progress}%` }}
            />
          </div>
        );
      })}

      <button
        className="btn btn--danger"
        onClick={onReset}
        style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
      >
        <RotateCcw size={14} />
        Reset a datos de Agendo
      </button>
    </aside>
  );
}
