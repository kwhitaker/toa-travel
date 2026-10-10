import { allNone } from "./journey";
import type { JourneyDayData } from "./types";
import sunSvg from "./assets/icons/sun.svg";
import rainSvg from "./assets/icons/cloud-rain.svg";
import stormSvg from "./assets/icons/cloud-lightning.svg";
import eyeSvg from "./assets/icons/eye.svg";

interface JourneyDayProps {
  day: JourneyDayData;
  idx: number;
  onToggle: () => void;
  onToggleDetails?: () => void;
  forMobile?: boolean;
}

const tdClass = "pv2 ph3";
const iconMap = { sun: sunSvg, rain: rainSvg, storm: stormSvg };
const weatherLabels = {
  sun: "Occasional Rain",
  rain: "Heavy Rain",
  storm: "Tropical Storm",
};

export default function JourneyDay({
  day,
  idx,
  onToggle,
  onToggleDetails,
  forMobile = false,
}: JourneyDayProps) {
  const { id, distance, hasPassed, lost, encounters, weather } = day;
  const checkboxId = forMobile ? `${id}-mobile` : id;

  return (
    <tr
      className={`striped--light-gray journey-day ${hasPassed ? "o-30" : ""}`}
    >
      <td
        className={`${tdClass} pointer ${forMobile ? "br b--black-30" : ""}`}
        style={{ height: forMobile ? "37px" : "" }}
      >
        <label for={checkboxId} className="pointer db w-auto-l w4-m w3">
          <input
            type="checkbox"
            checked={hasPassed}
            id={checkboxId}
            className="pointer"
            onChange={onToggle}
            aria-label={`Day ${idx + 1} completed`}
          />
          &nbsp;{idx + 1}
        </label>
      </td>
      {!forMobile && (
        <>
          <td className={`${tdClass} tc`}>
            <img
              src={iconMap[weather]}
              className="icon"
              alt={weatherLabels[weather]}
            />
          </td>
          <td className={`${tdClass} tc`}>{distance.join(", ")}</td>
          <td className={`${tdClass} tc`}>{lost.join(", ")}</td>
          <td className={`${tdClass} flex justify-between`}>
            <span className="w-100-l w6-m w4">
              {allNone(encounters) ? "--" : encounters.join(", ")}
            </span>
            {!allNone(encounters) && onToggleDetails && (
              <button
                type="button"
                className="bg-transparent bn pa0 pointer"
                onClick={onToggleDetails}
                title="View Encounters"
                aria-label={`View encounters for day ${idx + 1}`}
              >
                <img src={eyeSvg} className="icon" alt="" />
              </button>
            )}
          </td>
        </>
      )}
    </tr>
  );
}
