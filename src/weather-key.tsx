import { weatherDetails } from "./weather";

const iconClass = "flex light-gray w-25 items-center justify-center ph0-ns ph2";
const descClass = "flex pa2 w-75 items-start";

const WeatherKey = () => (
  <ul className="flex flex-wrap ba b--black-30 mb3 avenir f6-ns f7 pa0 w-100 weather-key">
    {Object.entries(weatherDetails).map(([weather, details]) => (
      <li
        key={weather}
        className={`flex weather-key-item ${details.legendClass}`}
      >
        <span className={iconClass}>
          <img src={details.legendIcon} className="icon" alt="" />
        </span>
        <span className={`${descClass} flex-column`}>
          <span>{details.label}</span>
          <small className="mt1">d20: {details.rolls}</small>
        </span>
      </li>
    ))}
  </ul>
);

export default WeatherKey;
