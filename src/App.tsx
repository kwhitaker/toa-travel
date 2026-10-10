import { Component } from "preact";
import type { TargetedEvent } from "preact";
import { Github, RefreshCw, Upload } from "preact-feather";
import logo from "./assets/toa-logo.png";
import { createSeed, DEFAULT_DAYS, generateJourney, MAX_DAYS } from "./journey";
import { loadJourney, saveJourney } from "./storage";
import type { EncounterDetailsData, SavedJourney } from "./types";
import JourneyDay from "./journey-day";
import WeatherKey from "./weather-key";
import EncounterDetails from "./encounter-details";
import ImportModal from "./import-modal";

interface AppState extends SavedJourney {
  isMobile: boolean;
  visibleDetails: EncounterDetailsData | null;
  showImport: boolean;
  storageError: string | null;
}

const thClass = "bg-black light-gray pv2 ph3 fw3 f6 tl";

export class App extends Component<Record<string, never>, AppState> {
  private mediaQuery: MediaQueryList | null = null;
  private skipInitialSave = false;

  constructor(props: Record<string, never>) {
    super(props);
    this.mediaQuery = window.matchMedia("(max-device-width: 568px)");
    this.state = {
      dayCount: DEFAULT_DAYS,
      journey: [],
      seed: createSeed(),
      isMobile: this.mediaQuery.matches,
      visibleDetails: null,
      showImport: false,
      storageError: null,
    };
  }

  componentDidMount(): void {
    this.mediaQuery?.addEventListener("change", this.handleResize);
    try {
      const existing = loadJourney();
      if (existing) {
        this.setState(existing);
        return;
      }
    } catch {
      this.skipInitialSave = true;
      this.setState({
        storageError:
          "Saved progress could not be loaded. You can import a valid journey.",
      });
    }
    this.setState({ journey: generateJourney(DEFAULT_DAYS, this.state.seed) });
  }

  componentDidUpdate(
    _previousProps: Record<string, never>,
    previousState: AppState,
  ): void {
    if (
      previousState.journey !== this.state.journey ||
      previousState.seed !== this.state.seed ||
      previousState.dayCount !== this.state.dayCount
    ) {
      const { dayCount, seed, journey } = this.state;
      if (this.skipInitialSave) {
        this.skipInitialSave = false;
        return;
      }
      try {
        saveJourney({ dayCount, seed, journey });
      } catch {
        if (!this.state.storageError) {
          this.setState({
            storageError:
              "Progress could not be saved in this browser. Changes will remain available until you close the page.",
          });
        }
      }
    }
    document.body.classList.toggle(
      "modal-open",
      this.state.visibleDetails !== null || this.state.showImport,
    );
  }

  componentWillUnmount(): void {
    this.mediaQuery?.removeEventListener("change", this.handleResize);
    document.body.classList.remove("modal-open");
  }

  render() {
    const {
      dayCount,
      journey,
      visibleDetails,
      seed,
      showImport,
      storageError,
    } = this.state;
    const elems = journey.map((day, index) => (
      <JourneyDay
        key={day.id}
        day={day}
        idx={index}
        onToggle={() => this.handleToggleDay(day.id)}
        onToggleDetails={() =>
          this.handleDetailsToggled(day.encounterDetails ?? null)
        }
      />
    ));
    return (
      <section className="flex flex-column w-90 ma0-ns ma2 justify-center items-center">
        {visibleDetails !== null && (
          <EncounterDetails
            details={visibleDetails}
            onRequestClose={() => this.handleDetailsToggled()}
          />
        )}
        <h1 className="athelas f2 mt3 mb1 mw-100">
          <img
            src={logo}
            width="500"
            className="mw-100"
            alt="Tomb of Annihilation"
          />
        </h1>
        <h3 className="avenir f4-ns f5 mvt0 mb4-ns mb2 normal">
          Travelogue using hex-crawl rules by{" "}
          <a
            href="https://skaldforge.wordpress.com/2017/10/02/tomb-of-annihilation-hex-crawl-procedure/"
            target="_blank"
            rel="noopener noreferrer"
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
                onKeyDown={(event) => {
                  if (event.key === "Enter") this.handleChangeDays(event);
                }}
                onBlur={this.handleChangeDays}
                min={1}
                max={MAX_DAYS}
                step={1}
                id="day-count"
                className="w-25 ph2 pv1 ba b--black-10"
                value={dayCount}
              />
            </div>
            <div className="w-auto-ns w-100 mh2-ns mv2 flex flex-row items-center">
              <label htmlFor="seed-random" className="mr1 ph2-ns f5-ns f6">
                Seed:
              </label>
              <input
                type="text"
                onChange={this.handleChangeSeed}
                onKeyDown={(event) => {
                  if (event.key === "Enter") this.handleChangeSeed(event);
                }}
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
          {storageError && (
            <p role="status" className="avenir dark-red">
              {storageError}
            </p>
          )}
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
            onImport={this.handleImport}
          />
        )}
      </section>
    );
  }

  private renderMobileTable() {
    const { isMobile, journey } = this.state;
    if (!isMobile || !journey.length) return null;
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
        <tbody>
          {journey.map((day, index) => (
            <JourneyDay
              key={day.id}
              day={day}
              idx={index}
              onToggle={() => this.handleToggleDay(day.id)}
              forMobile
            />
          ))}
        </tbody>
      </table>
    );
  }

  private handleChangeDays = (event: TargetedEvent<HTMLInputElement>): void => {
    const dayCount = Number(event.currentTarget.value);
    if (
      !Number.isInteger(dayCount) ||
      dayCount < 1 ||
      dayCount > MAX_DAYS ||
      dayCount === this.state.dayCount
    )
      return;
    this.setState({
      dayCount,
      journey: generateJourney(dayCount, this.state.seed, this.state.journey),
    });
  };

  private handleChangeSeed = (event: TargetedEvent<HTMLInputElement>): void => {
    const seed = event.currentTarget.value;
    if (!seed.trim() || seed === this.state.seed) return;
    this.setState({
      seed,
      journey: generateJourney(this.state.dayCount, seed, this.state.journey),
    });
  };

  private handleToggleDay = (id: string): void => {
    this.setState(({ journey }) => ({
      journey: journey.map((day) =>
        day.id === id ? { ...day, hasPassed: !day.hasPassed } : day,
      ),
    }));
  };

  private handleRegen = (): void => {
    const seed = createSeed();
    this.setState({
      seed,
      journey: generateJourney(this.state.dayCount, seed, this.state.journey),
    });
  };

  private handleResize = (event: MediaQueryListEvent): void => {
    this.setState({ isMobile: event.matches });
  };

  private handleDetailsToggled = (
    visibleDetails: EncounterDetailsData | null = null,
  ): void => {
    this.setState({ visibleDetails });
  };

  private handleImportToggled = (): void => {
    this.setState(({ showImport }) => ({ showImport: !showImport }));
  };

  private handleImport = (next: SavedJourney): void => {
    this.setState({ ...next, showImport: false });
  };
}
