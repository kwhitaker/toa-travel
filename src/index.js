import { App } from "./App";
import { render } from "preact";
import * as Lockr from "lockr";

Lockr.setPrefix("toa");

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
