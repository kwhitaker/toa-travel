import Modal from "./modal";
import type { EncounterDetailsData } from "./types";

interface EncounterDetailsProps {
  details: EncounterDetailsData;
  onRequestClose: () => void;
}

const thClass = "bb b-white pa2 tl";
const tdClass = "pa2 ttc";

export default function EncounterDetails({
  details,
  onRequestClose,
}: EncounterDetailsProps) {
  return (
    <Modal
      title="Encounter Details"
      onRequestClose={onRequestClose}
      className="bg-black shadow-1 w-auto-ns w-90 overflow-y-auto h-auto-ns h-75 pa3 white avenir relative"
    >
      <div className="flex flex-row-ns flex-column items-center justify-between">
        {details.map((group, index) => (
          <table
            key={index}
            className="w-auto-ns w-100 ba b-white mv0-ns mv2 mh2 f6 collapse"
          >
            <thead>
              <tr>
                <th className={`${thClass} br`}>Terrain</th>
                <th className={thClass}>Encounter</th>
                <th className={thClass}>Count/Info</th>
              </tr>
            </thead>
            <tbody>
              {group.map(({ encounter, terrain }) => (
                <tr key={terrain} className="bb b-white">
                  <td className={`${tdClass} br`}>{terrain}</td>
                  <td className={tdClass}>{encounter.type}</td>
                  <td className={tdClass}>
                    {"count" in encounter ? encounter.count : encounter.info}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </Modal>
  );
}
