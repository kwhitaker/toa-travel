import "tachyons";
import "./style";
import logo from "./assets/toa-logo.png";
import { Component } from "preact";
import {
  addIndex,
  assoc,
  findIndex,
  isNil,
  map,
  omit,
  pick,
  pipe,
  propEq,
  range,
  update,
} from "ramda";
import * as Lockr from "lockr";

import { setSeed } from "./journey";
import { generateDay } from "./journey";
import JourneyDay from "./journey-day";
import WeatherKey from "./weather-key";
import EncounterDetails from "./encounter-details";
import { Github, RefreshCw, Upload } from "preact-feather";
import ImportModal from "./import-modal";

const MAX_DAYS = 365;
const DEFAULT_DAYS = 79;

const thClass = "bg-black light-gray pv2 ph3 fw3 f6 tl";

const genSeed = () => Math.floor(Math.random() * 1000000);

const genJourney = (days, seed) => {
  setSeed(seed);
  return range(0, days).map(generateDay);
};

export class App extends Component {
  mediaQuery;

  constructor(props) {
    super(props);

    if (typeof window !== "undefined") {
      this.mediaQuery = window.matchMedia("(max-device-width: 568px)");
    }

    this.state = {
      dayCount: DEFAULT_DAYS,
      journey: [],
      isMobile: this.mediaQuery && this.mediaQuery.matches,
      visibleDetails: null,
      seed: genSeed(),
      showImport: false,
    };
  }

  componentDidMount() {
    const existing = Lockr.get("journey");
    this.mediaQuery && this.mediaQuery.addListener(this.handleResize);

    if (!existing) {
      this.setState({
        journey: genJourney(DEFAULT_DAYS, this.state.seed),
      });
    } else {
      this.setState(existing);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextState) !== JSON.stringify(this.state);
  }

  componentDidUpdate(lastProps, lastState) {
    Lockr.set(
      "journey",
      omit(["isMobile", "visibleDetails", "showImport"], this.state)
    );

    if (!lastState.visibleDetails && this.state.visibleDetails) {
      document.querySelector("body").classList.add("modal-open");
    } else {
      document.querySelector("body").classList.remove("modal-open");
    }
  }

  componentWillUnmount() {
    this.mediaQuery && this.mediaQuery.removeListener(this.handleResize);
  }

  render(props, { results = [] }) {
    const { dayCount, journey, visibleDetails, seed, showImport } = this.state;
    const elems = journey.map((d, i) => (
      <JourneyDay
        {...d}
        idx={i}
        onToggle={() => this.handleToggleDay(d.id)}
        onToggleDetails={() => this.handleDetailsToggled(d.encounterDetails)}
      />
    ));

    return (
      <section className="flex flex-column w-90 ma0-ns ma2 justify-center items-center">
        {!isNil(visibleDetails) && (
          <EncounterDetails
            details={visibleDetails}
            onRequestClose={() => this.handleDetailsToggled()}
          />
        )}
        <h1 className="athelas f2 mt3 mb1">
          <img src={logo} width="500" alt="Tomb of Annihilation" />
        </h1>
        <h3 className="avenir f4-ns f5 mvt0 mb4-ns mb2 normal">
          Travelogue using hex-crawl rules by{" "}
          <a
            href="https://skaldforge.wordpress.com/2017/10/02/tomb-of-annihilation-hex-crawl-procedure/"
            target="_blank"
          >
            Kyle Maxwell
          </a>
        </h3>
        <div className="w-100">
          <div className="w-100 mv2 pa0 flex items-center flex-row-ns flex-column avenir">
            <div className="w-auto-ns w-100 mh2-ns mv2 flex flex-row items-center">
              <label htmlFor="day-count" className="mr1 f5-ns f6">
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
                className="w-25 ph2 pv1 ba b--black-10"
                defaultValue={dayCount}
              />
            </div>
            <div className="w-auto-ns w-100 mh2-ns mv2 flex flex-row items-center">
              <label htmlFor="seed-random" className="mr1 ph2-ns f5-ns f6">
                Seed:
              </label>
              <input
                type="text"
                onChange={this.handleChangeSeed}
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleChangeSeed}
                id="seed-random"
                className="w-33 pv1 ba b--black-10"
                value={seed}
              />
              <button
                className="f6 link dim ba ph2 pv1 dib near-black pointer ml2 bg-transparent br2 flex items-center justify-center"
                title="Generate New Travelogue"
                onClick={this.handleRegen}
              >
                <RefreshCw size={18} />
              </button>
              <button
                className="f6 link dim ba ph2 pv1 dib near-black pointer ml2 bg-transparent br2 flex items-center justify-center"
                title="Import Data From Previous Version"
                onClick={this.handleImportToggled}
              >
                <span className="mr2">Import Data</span>
                <Upload size={18} />
              </button>
            </div>
          </div>
          <WeatherKey />
          <div className="w-100 ba b--black-30 mb3 relative f5-ns f6">
            <div className="w-100 overflow-x-auto">
              <table className="avenir collapse w-100-ns w-auto">
                <thead>
                  <tr>
                    <th className={thClass}>Day</th>
                    <th className={thClass}>Weather</th>
                    <th className={`${thClass} tc`}>
                      Distance <small className="nowrap">(slow, fast)</small>
                    </th>
                    <th className={`${thClass} tc`}>
                      Direction <small className="nowrap">(if lost)</small>
                    </th>
                    <th className={`${thClass}`}>Encounters</th>
                  </tr>
                </thead>
                <tbody>{elems}</tbody>
              </table>
              {this.renderMobileTable()}
            </div>
          </div>
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
              <Github size={18} />
            </a>
          </p>
        </div>
        {showImport && (
          <ImportModal
            onRequestClose={this.handleImportToggled}
            onImport={this.handleIport}
          />
        )}
      </section>
    );
  }

  renderMobileTable() {
    const { isMobile, journey } = this.state;
    if (!isMobile || !journey.length) {
      return null;
    }

    const rows = pipe(
      map(pick(["hasPassed", "id"])),
      addIndex(map)((d, i) => (
        <JourneyDay
          {...d}
          idx={i}
          onToggle={() => this.handleToggleDay(d.id)}
          forMobile={true}
        />
      ))
    )(journey);

    return (
      <table
        aria-hidden={true}
        className="avenir collapse w-auto absolute top-0 left-0 h-100 bg-white mobile-overlay"
      >
        <thead>
          <tr>
            <th className={thClass} style={{ height: "48px" }}>
              Day
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  handleChangeDays = (e) => {
    const dayCount = parseInt(e.currentTarget.value);
    const { seed, journey } = this.state;

    if (dayCount <= 0 || isNaN(dayCount) || dayCount > MAX_DAYS) {
      return;
    }

    const passedDays = journey.map((d) => d.hasPassed);
    const nextJourney = genJourney(dayCount, seed).map((d, idx) => ({
      ...d,
      hasPassed: passedDays[idx],
    }));

    this.setState({
      dayCount,
      journey: nextJourney,
    });
  };

  handleChangeSeed = (e) => {
    const seed = e.currentTarget.value;
    if (seed == "" || seed == undefined) {
      return;
    }

    const { journey, dayCount } = this.state;

    const passedDays = journey.map((d) => d.hasPassed);
    const nextJourney = genJourney(dayCount, seed).map((d, idx) => ({
      ...d,
      hasPassed: passedDays[idx],
    }));

    this.setState({
      seed,
      journey: nextJourney,
    });
  };

  handleKeyDown = (e) => {
    if (e.keyCode !== 13) {
      return;
    }

    this.handleChangeDays(e);
  };

  handleToggleDay = (id) => {
    const { journey } = this.state;
    const idx = findIndex(propEq("id", id))(journey);
    const day = journey[idx];
    const updated = assoc("hasPassed", !day.hasPassed, day);
    this.setState({
      journey: update(idx, updated, journey),
    });
  };

  handleRegen = (e) => {
    e.preventDefault();
    Lockr.flush();

    const { journey } = this.state;

    const nextSeed = genSeed();
    const passedDays = journey.map((d) => d.hasPassed);
    const nextJourney = genJourney(this.state.dayCount, nextSeed).map(
      (d, idx) => ({
        ...d,
        hasPassed: passedDays[idx],
      })
    );

    this.setState({
      seed: nextSeed,
      journey: nextJourney,
    });
  };

  handleResize = (e) => {
    this.setState({
      isMobile: e.matches,
    });
  };

  handleDetailsToggled = (visibleDetails = null) => {
    this.setState({
      visibleDetails,
    });
  };

  handleImportToggled = () => {
    this.setState({
      showImport: !this.state.showImport,
    });
  };

  handleIport = (next) => {
    this.setState({
      ...this.state,
      ...next,
      showImport: false,
    });
  };
}
