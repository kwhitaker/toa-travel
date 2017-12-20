const thClass = "bb b-white pa2 tl";
const tdClass = "pa2 ttc";

const EncounterRow = ({ encounter, terrain }) => {
  return (
    <tr className="bb b-white">
      <td className={`${tdClass} br`}>{terrain}</td>
      <td className={tdClass}>{encounter.type}</td>
      <td className={tdClass}>{encounter.count || encounter.info}</td>
    </tr>
  );
};

const EncounterTable = ({ details }) => {
  const rows = details.map((e, i) => <EncounterRow {...e} key={i} />);
  return (
    <table className="w-auto-ns w-100 ba b-white mv0-ns mv2 mh2 f6 collapse">
      <thead>
        <th className={`${thClass} br`}>Terrain</th>
        <th className={thClass}>Encounter</th>
        <th className={thClass}>Count/Info</th>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

const EncounterDetails = ({ details, onRequestClose }) => {
  const tables = details.map((d, i) => <EncounterTable details={d} key={i} />);

  return (
    <div
      className="encounter-details-overlay w-100 h-100 flex items-center justify-center top-0 left-0"
      onClick={onRequestClose}
    >
      <div className="bg-black shadow-1 w-auto-ns w-90 overflow-y-auto h-auto-ns h-75 pa3 white avenir relative">
        <div className="flex items-center justify-between mt0 mb1 mh2">
          <h3 className="f5 w-50 ma0">Encounter Details</h3>
          <button
            className="pointer bg-black bn white"
            onClick={onRequestClose}
          >
            &times;
          </button>
        </div>
        <div className="flex flex-row-ns flex-column items-center justify-between">
          {tables}
        </div>
      </div>
    </div>
  );
};

export default EncounterDetails;
