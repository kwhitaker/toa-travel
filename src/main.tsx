import { render } from "preact";
import "tachyons/css/tachyons.min.css";
import "./style/index.scss";
import { App } from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing application root element.");
}

render(<App />, root);
