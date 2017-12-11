import * as sunSvg from "./assets/icons/sun.svg";
import * as rainSvg from "./assets/icons/cloud-rain-wht.svg";
import * as stormSvg from "./assets/icons/cloud-lightning-wht.svg";

const liClass = "flex w-third";
const iconClass = "flex light-gray w-25 items-center justify-center ph0-ns ph2";
const descClass = "flex pa2 w-75 items-start";

const WeatherKey = () => (
  <ul className="flex ba b--black-30 mb3 avenir f6-ns f7 pa0 w-100 weather-key">
    <li className={liClass}>
      <span className={`${iconClass} bg-lightest-blue`}>
        <img src={sunSvg} className="icon" />
      </span>
      <span className={`${descClass} bg-lightest-blue`}>Occasional Rain</span>
    </li>
    <li className={liClass}>
      <span className={`${iconClass} bg-dark-blue`}>
        <img src={rainSvg} className="icon white" />
      </span>
      <span className={`${descClass} bg-dark-blue white`}>Heavy Rain</span>
    </li>
    <li className={liClass}>
      <span className={`${iconClass} bg-navy`}>
        <img src={stormSvg} className="icon white" />
      </span>
      <span className={`${descClass} bg-navy white`}>Tropical Storm</span>
    </li>
  </ul>
);

export default WeatherKey;
