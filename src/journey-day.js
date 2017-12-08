import { all, equals } from "ramda";
import { CloudLightning, CloudRain, Sun } from "react-feather";

const tdClass = "pv2 ph3";
const parseEncounters = encounters =>
  all(equals("none"))(encounters) ? `--` : encounters.join(", ");

const iconMap = {
  normal: () => <Sun />,
  rain: () => <CloudRain />,
  storm: () => <CloudLightning />
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
    onToggle
  } = props;

  return (
    <tr key={id} className={`striped--light-gray ${hasPassed ? "o-30" : ""}`}>
      <td className={tdClass}>
        <label for={id} className="pointer">
          <input
            type="checkbox"
            checked={hasPassed}
            onChange={onToggle}
            id={id}
            className="pointer"
          />
          &nbsp;
          {idx + 1}
        </label>
      </td>
      <td className={`${tdClass} tc`}>{iconMap[weather]()}</td>
      <td className={`${tdClass} tc`}>{distance.join(", ")}</td>
      <td className={`${tdClass} tc`}>{lost.join(", ")}</td>
      <td className={tdClass}>{parseEncounters(encounters)}</td>
    </tr>
  );
};

export default JourneyDay;
