import { all, equals } from "ramda";
import * as sunSvg from "./assets/icons/sun.svg";
import * as rainSvg from "./assets/icons/cloud-rain.svg";
import * as stormSvg from "./assets/icons/cloud-lightning.svg";

const tdClass = "pv2 ph3";
const parseEncounters = encounters =>
  all(equals("none"))(encounters) ? `--` : encounters.join(", ");

const iconMap = {
  sun: sunSvg,
  rain: rainSvg,
  storm: stormSvg
};

const JourneyDay = props => {
  const {
    id,
    idx,
    distance,
    hasPassed,
    lost,
    encounters,
    weather,
    onToggle,
    forMobile
  } = props;

  return (
    <tr
      key={id}
      className={`striped--light-gray pointer journey-day ${
        hasPassed ? "o-30" : ""
      }`}
      onClick={onToggle}
    >
      <td
        className={`${tdClass} ${forMobile ? "br b--black-30" : ""}`}
        style={{ height: forMobile ? "38px" : "" }}
      >
        <label for={id} className="pointer db w-auto-ns w3">
          <input
            type="checkbox"
            checked={hasPassed}
            id={id}
            className="pointer"
          />
          &nbsp;
          {idx + 1}
        </label>
      </td>
      {!forMobile && (
        <td className={`${tdClass} tc`}>
          <img src={iconMap[weather]} className="icon" />
        </td>
      )}
      {!forMobile && <td className={`${tdClass} tc`}>{distance.join(", ")}</td>}
      {!forMobile && <td className={`${tdClass} tc`}>{lost.join(", ")}</td>}
      {!forMobile && (
        <td className={tdClass}>
          <span className="db w-auto-ns w4">{parseEncounters(encounters)}</span>
        </td>
      )}
    </tr>
  );
};

export default JourneyDay;
