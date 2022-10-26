import { App } from "./App";
import { render } from "preact";

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
