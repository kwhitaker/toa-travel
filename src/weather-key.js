import { CloudLightning, CloudRain, Sun } from "react-feather";

const liClass = "flex w-third";
const iconClass = "flex light-gray w-25 items-center justify-center";
const descClass = "flex pv2 ph3 w-75 items-start";

const WeatherKey = () => (
  <ul className="flex ba b--black-30 mb3 avenir f6 pa0 w-100">
    <li className={liClass}>
      <span className={`${iconClass} bg-lightest-blue`}>
        <Sun className="black" />
      </span>
      <span className={`${descClass} bg-lightest-blue`}>Occasional Rain</span>
    </li>
    <li className={liClass}>
      <span className={`${iconClass} bg-dark-blue`}>
        <CloudRain />
      </span>
      <span className={`${descClass} bg-dark-blue white`}>Heavy Rain</span>
    </li>
    <li className={liClass}>
      <span className={`${iconClass} bg-navy`}>
        <CloudLightning />
      </span>
      <span className={`${descClass} bg-navy white`}>Tropical Storm</span>
    </li>
  </ul>
);

export default WeatherKey;
