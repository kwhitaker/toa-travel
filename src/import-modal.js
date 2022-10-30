import { has } from "ramda";
import { useState } from "preact/hooks";

const validateDay = (day) => {
  let isValid = false;
  const requiredKeys = [
    "id",
    "distance",
    "hasPassed",
    "lost",
    "encounters",
    "weather",
  ];

  isValid = requiredKeys.every((k) => has(day, k));

  if (day?.distance?.length !== 2) {
    isValid = false;
  }

  if (!["sun", "rain", "storm"].includes(day?.weather)) {
    isValid = false;
  }

  if (day.lost?.length !== 2) {
    isValid = false;
  }

  if (day?.encounters?.length !== 3) {
    isValid = false;
  }

  isValid = true;
  return isValid;
};

const ImportModal = ({ onRequestClose, onImport }) => {
  const [inputData, setInputData] = useState();
  const [error, setError] = useState();

  const handleInputChanged = (e) => {
    e.preventDefault();

    const next = e.currentTarget.value;

    if (!next) {
      return;
    }

    setInputData(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputData) {
      return;
    }

    try {
      const parsed = JSON.parse(inputData)?.data;

      if (!parsed.seed || isNaN(Number(parsed.seed))) {
        throw new Error("No valid seed value provided.");
      }

      if (!parsed.dayCount || isNaN(Number(parsed.dayCount))) {
        throw new Error("No day count value provided.");
      }

      if (!parsed.journey?.length) {
        throw new Error("No journey provided.");
      }

      const validJourney = parsed.journey.every(validateDay);

      if (!validJourney) {
        throw new Error("Invalid journey data");
      }

      setError();
      onImport(parsed);
    } catch (e) {
      console.error(e);
      setError(`${e}`);
    }
  };

  const handleClose = () => {
    setError();
    setInputData();
    onRequestClose();
  };

  return (
    <div className="encounter-details-overlay w-100 h-100 flex items-center justify-center top-0 left-0">
      <div className="bg-black shadow-1 w-50-ns w-90 overflow-y-auto h-auto-ns h-75 pa3 white avenir relative">
        <div className="flex items-center justify-between mt0 mb1 mh2">
          <h3 className="f5 w-50 ma0">Import Data</h3>
          <button className="pointer bg-black bn white" onClick={handleClose}>
            &times;
          </button>
        </div>
        <form
          className="flex flex-column items-center justify-between"
          onSubmit={handleSubmit}
        >
          {!!error && <p className="w-100 mv2 f5 b red avenir">{error}</p>}
          <textarea
            className="w-100 h5 mv2"
            name="import-data"
            onChange={handleInputChanged}
            onBlur={handleInputChanged}
          />
          <div className="flex flex-row justify-end items-center">
            <button
              onClick={handleClose}
              className="f6 mr2 link dim ba ph2 pv1 dib white pointer ml2 bg-dark-red br2 b--dark-red flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={!inputData}
              className="f6 link dim ba ph2 pv1 dib near-black pointer ml2 bg-white br2 flex items-center justify-center"
              style={{ cursor: !!inputData ? "pointer" : "not-allowed" }}
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
