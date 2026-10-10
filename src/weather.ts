import type { Weather } from "./types";
import sunSvg from "./assets/icons/sun.svg";
import drizzleSvg from "./assets/icons/cloud-drizzle.svg";
import rainSvg from "./assets/icons/cloud-rain.svg";
import whiteRainSvg from "./assets/icons/cloud-rain-wht.svg";
import stormSvg from "./assets/icons/cloud-lightning.svg";
import whiteStormSvg from "./assets/icons/cloud-lightning-wht.svg";

interface WeatherDetails {
  label: string;
  rolls: string;
  description: string;
  icon: string;
  legendIcon: string;
  legendClass: string;
}

export const weatherDetails: Record<Weather, WeatherDetails> = {
  sunny: {
    label: "Sunny",
    rolls: "1–10",
    description: "Sunny, clear skies - proceed as normal.",
    icon: sunSvg,
    legendIcon: sunSvg,
    legendClass: "bg-light-yellow",
  },
  "light-rain": {
    label: "Light Rain",
    rolls: "11–15",
    description: "Occasional light rain - roll 1d4 for inches of rain.",
    icon: drizzleSvg,
    legendIcon: drizzleSvg,
    legendClass: "bg-lightest-blue",
  },
  "heavy-rain": {
    label: "Heavy Rain",
    rolls: "16–18",
    description:
      "Heavy rain - visibility limited to 150ft, roll 1d4+2 for inches of rain.",
    icon: rainSvg,
    legendIcon: whiteRainSvg,
    legendClass: "bg-dark-blue white",
  },
  storm: {
    label: "Tropical Storm",
    rolls: "19–20",
    description:
      "Tropical storm - travel by canoe impossible, travel on foot gains 1 level of exhaustion if DC 15 Constitution save is failed. Disadvantage on checks to avoid becoming lost. 8 inches of rain.",
    icon: stormSvg,
    legendIcon: whiteStormSvg,
    legendClass: "bg-navy white",
  },
};
