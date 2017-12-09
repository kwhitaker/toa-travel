import "tachyons";
import "./style";

import { Component, render } from "preact";
import { assoc, findIndex, propEq, range, update } from "ramda";
import * as Lockr from "lockr";
import { Github } from "react-feather";

import { generateDay } from "./journey";
import JourneyDay from "./journey-day";
import WeatherKey from "./weather-key";

const MAX_DAYS = 365;
const DEFAULT_DAYS = 79;

const thClass = "bg-black light-gray pv2 ph3 fw3 f6 tl";

const genJourney = days => range(0, days).map(generateDay);

Lockr.prefix = "toa";

export default class App extends Component {
  state = {
    dayCount: 1,
    journey: []
  };

  componentDidMount() {
    const existing = Lockr.get("journey");
    if (!existing) {
      this.setState({
        dayCount: DEFAULT_DAYS,
        journey: genJourney(DEFAULT_DAYS)
      });
    } else {
      this.setState(JSON.parse(existing));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextState) !== JSON.stringify(this.state);
  }

  componentDidUpdate(lastProps, lastState) {
    Lockr.set("journey", JSON.stringify(this.state));
  }

  render(props, { results = [] }) {
    const { dayCount, journey } = this.state;
    const elems = journey.map((d, i) => (
      <JourneyDay {...d} idx={i} onToggle={() => this.handleToggleDay(d.id)} />
    ));

    return (
      <section className="flex flex-column mw-9 justify-center items-center">
        <h1 className="athelas f2 mt3 mb1">
          <img
            src="https://imgur.com/HxqNxtV.png"
            width="500"
            alt="Tomb of Annihilation"
          />
        </h1>
        <h3 className="avenir f4 mvt0 mb4 normal">
          Travelogue using hex-crawl rules by{" "}
          <a
            href="https://skaldforge.wordpress.com/2017/10/02/tomb-of-annihilation-hex-crawl-procedure/"
            target="_blank"
          >
            Kyle Maxwell
          </a>
        </h3>
        <div className="mw-6">
          <div className="w-100 mv2 pa0 flex items-center avenir">
            <label htmlFor="day-count" className="mr1">
              Days to Generate (max {MAX_DAYS}):
            </label>
            <input
              type="number"
              onChange={this.handleChangeDays}
              onKeyDown={this.handleKeyDown}
              onBlur={this.handleChangeDays}
              min={1}
              max={MAX_DAYS}
              step={1}
              id="day-count"
              className="w-25 ph2 pv1"
              defaultValue={dayCount}
            />
          </div>
          <WeatherKey />
          <table className="avenir collapse ba br2 b--black-30 ttc mb3">
            <thead>
              <th className={thClass}>Day</th>
              <th className={thClass}>Weather</th>
              <th className={`${thClass} tc`}>
                Distance <small>(slow, fast)</small>
              </th>
              <th className={`${thClass} tc`}>
                Direction <small>(if lost)</small>
              </th>
              <th className={thClass}>Encounters</th>
            </thead>
            <tbody>{elems}</tbody>
          </table>
          <p className="f7 tl avenir mh0">
            Code written by{" "}
            <a href="http://kevin-whitaker.net">Kevin Whitaker</a>.
          </p>
          <p className="f7 tl avenir mh0">
            Tomb of Annihilation copyright{" "}
            <a href="http://wizards.com">Wizards of the Coast</a>.
          </p>
          <p className="tl avenir mh0">
            <a
              href="https://github.com/kwhitaker/toa-travel"
              title="Fork on Github"
            >
              <Github width={18} height={18} className="black" />
            </a>
          </p>
        </div>
      </section>
    );
  }

  handleChangeDays = e => {
    const dayCount = parseInt(e.currentTarget.value);
    if (dayCount <= 0 || isNaN(dayCount) || dayCount > MAX_DAYS) {
      return;
    }

    this.setState({
      dayCount,
      journey: genJourney(dayCount)
    });
  };

  handleKeyDown = e => {
    if (e.keyCode !== 13) {
      return;
    }

    this.handleChangeDays(e);
  };

  handleToggleDay = id => {
    const { journey } = this.state;
    const idx = findIndex(propEq("id", id))(journey);
    const day = journey[idx];
    const updated = assoc("hasPassed", !day.hasPassed, day);
    this.setState({
      journey: update(idx, updated, journey)
    });
  };
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
