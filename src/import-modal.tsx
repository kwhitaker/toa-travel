import { useState } from "preact/hooks";
import { importJourney } from "./saved-journey";
import type { SavedJourney } from "./types";
import Modal from "./modal";

interface ImportModalProps {
  onRequestClose: () => void;
  onImport: (journey: SavedJourney) => void;
}

export default function ImportModal({
  onRequestClose,
  onImport,
}: ImportModalProps) {
  const [inputData, setInputData] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (): void => {
    if (!inputData.trim()) return;
    try {
      onImport(importJourney(inputData));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Invalid journey data.",
      );
    }
  };

  return (
    <Modal
      title="Import Data"
      onRequestClose={onRequestClose}
      className="bg-black shadow-1 w-50-ns w-90 overflow-y-auto h-auto-ns h-75 pa3 white avenir relative"
    >
      <form
        className="flex flex-column items-center justify-between"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        {error && (
          <p role="alert" className="w-100 mv2 f5 b red avenir">
            {error}
          </p>
        )}
        <textarea
          aria-label="Journey JSON"
          className="w-100 h5 mv2"
          name="import-data"
          value={inputData}
          onInput={(event) => setInputData(event.currentTarget.value)}
        />
        <div className="flex flex-row justify-end items-center">
          <button
            type="button"
            onClick={onRequestClose}
            className="f6 mr2 link dim ba ph2 pv1 dib white pointer ml2 bg-dark-red br2 b--dark-red flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!inputData.trim()}
            className="f6 link dim ba ph2 pv1 dib near-black pointer ml2 bg-white br2 flex items-center justify-center"
            style={{ cursor: inputData.trim() ? "pointer" : "not-allowed" }}
          >
            Import
          </button>
        </div>
      </form>
    </Modal>
  );
}
