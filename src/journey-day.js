import { allNone } from "./journey";
import sunSvg from "./assets/icons/sun.svg";
import rainSvg from "./assets/icons/cloud-rain.svg";
import stormSvg from "./assets/icons/cloud-lightning.svg";
import eyeSvg from "./assets/icons/eye.svg";

const tdClass = "pv2 ph3";
const parseEncounters = (encounters = []) => {
  if (!encounters?.length) {
    return "--";
  }

  return allNone(encounters) ? `--` : encounters.join(", ");
};

const iconMap = {
  sun: sunSvg,
  rain: rainSvg,
  storm: stormSvg,
};

const JourneyDay = (props) => {
  const {
    id,
    idx,
    distance,
    hasPassed,
    lost,
    encounters,
    weather,
    onToggle,
    onToggleDetails,
    forMobile,
  } = props;

  return (
    <tr
      key={id}
      className={`striped--light-gray journey-day ${hasPassed ? "o-30" : ""}`}
    >
      <td
        className={`${tdClass} pointer ${forMobile ? "br b--black-30" : ""}`}
        style={{ height: forMobile ? "37px" : "" }}
      >
        <label for={id} className="pointer db w-auto-l w4-m w3">
          <input
            type="checkbox"
            checked={hasPassed}
            id={id}
            className="pointer"
            onChange={onToggle}
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
      {!forMobile && (
        <td className={`${tdClass} tc`}>{(distance || []).join(", ")}</td>
      )}
      {!forMobile && (
        <td className={`${tdClass} tc`}>{(lost || []).join(", ")}</td>
      )}
      {!forMobile && (
        <td className={`${tdClass} flex justify-between`}>
          <span className="w-100-l w6-m w4">{parseEncounters(encounters)}</span>
          {!allNone(encounters) && (
            <img
              src={eyeSvg}
              className="icon pointer"
              onClick={onToggleDetails}
              role="button"
              title="View Encounters"
            />
          )}
        </td>
      )}
    </tr>
  );
};

export default JourneyDay;
