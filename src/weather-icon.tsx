import { createPortal } from "preact/compat";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "preact/hooks";
import type { Weather } from "./types";
import { weatherDetails } from "./weather";

interface WeatherIconProps {
  weather: Weather;
  dayNumber: number;
}

export default function WeatherIcon({ weather, dayNumber }: WeatherIconProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const details = weatherDetails[weather];

  useLayoutEffect(() => {
    if (!visible || !trigger.current || !tooltip.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    const { width, height } = tooltip.current.getBoundingClientRect();
    setPosition({
      left: Math.max(
        8,
        Math.min(
          anchor.left + anchor.width / 2 - width / 2,
          innerWidth - width - 8,
        ),
      ),
      top:
        anchor.bottom + height + 8 <= innerHeight
          ? anchor.bottom + 8
          : Math.max(8, anchor.top - height - 8),
    });
  }, [visible, weather]);

  useEffect(() => {
    if (!visible) return;
    const hide = () => setVisible(false);
    window.addEventListener("resize", hide);
    document.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("resize", hide);
      document.removeEventListener("scroll", hide, true);
    };
  }, [visible]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="weather-trigger bg-transparent bn pa0 pointer"
        aria-label={`${details.label} weather for day ${dayNumber}`}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => {
          if (document.activeElement !== trigger.current) setVisible(false);
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setVisible(false);
        }}
      >
        <img src={details.icon} className="icon" alt="" />
      </button>
      {visible &&
        createPortal(
          <span
            ref={tooltip}
            id={tooltipId}
            role="tooltip"
            className="weather-tooltip avenir f6 bg-near-black white pa3 br2"
            style={position}
          >
            {details.description}
          </span>,
          document.body,
        )}
    </>
  );
}
