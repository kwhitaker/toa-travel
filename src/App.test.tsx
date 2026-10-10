import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { generateJourney } from "./journey";
import { JOURNEY_STORAGE_KEY, loadJourney, saveJourney } from "./storage";
import type { SavedJourney } from "./types";

function savedJourney(dayCount = 3): SavedJourney {
  return { dayCount, seed: 123456, journey: generateJourney(dayCount, 123456) };
}

describe("travelogue", () => {
  it("generates and saves the default 79 days", async () => {
    render(<App />);
    expect(await screen.findAllByRole("checkbox")).toHaveLength(79);
    expect(loadJourney()?.dayCount).toBe(79);
  });

  it("restores the same seed, records, and checkmarks after reopening", async () => {
    const saved = savedJourney();
    saveJourney(saved);
    const firstRender = render(<App />);
    await userEvent.click(
      await screen.findByRole("checkbox", { name: "Day 1 completed" }),
    );
    expect(loadJourney()?.journey[0]?.hasPassed).toBe(true);
    firstRender.unmount();
    render(<App />);
    expect(
      await screen.findByRole("checkbox", { name: "Day 1 completed" }),
    ).toBeChecked();
    expect(screen.getByLabelText("Seed:")).toHaveValue("123456");
    expect(loadJourney()?.journey[0]?.id).toBe(saved.journey[0]?.id);
  });

  it("restores legacy occasional rain as light rain and keeps it after reopening", async () => {
    const saved = savedJourney();
    localStorage.setItem(
      JOURNEY_STORAGE_KEY,
      JSON.stringify({
        data: {
          ...saved,
          journey: saved.journey.map((day) => ({
            ...day,
            weather: "sun",
            hasPassed: true,
          })),
        },
      }),
    );
    const firstRender = render(<App />);
    await userEvent.hover(
      screen.getByRole("button", { name: "Light Rain weather for day 1" }),
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Occasional light rain - roll 1d4 for inches of rain.",
    );
    expect(loadJourney()?.journey[0]?.weather).toBe("light-rain");
    firstRender.unmount();
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Light Rain weather for day 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Day 1 completed" }),
    ).toBeChecked();
    expect(loadJourney()?.journey[0]?.id).toBe(saved.journey[0]?.id);
    expect(screen.getByText("d20: 1–10")).toBeInTheDocument();
    expect(screen.getByText("d20: 11–15")).toBeInTheDocument();
    expect(screen.getByText("d20: 16–18")).toBeInTheDocument();
    expect(screen.getByText("d20: 19–20")).toBeInTheDocument();
  });

  it("preserves checkmarks when extending, changing seed, or refreshing", async () => {
    saveJourney(savedJourney());
    localStorage.setItem("other-app", "keep me");
    render(<App />);
    await userEvent.click(
      await screen.findByRole("checkbox", { name: "Day 1 completed" }),
    );
    fireEvent.change(screen.getByLabelText(/Days to Generate/), {
      target: { value: "5" },
    });
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(
      screen.getByRole("checkbox", { name: "Day 5 completed" }),
    ).not.toBeChecked();
    fireEvent.change(screen.getByLabelText("Seed:"), {
      target: { value: "new seed" },
    });
    expect(
      screen.getByRole("checkbox", { name: "Day 1 completed" }),
    ).toBeChecked();
    await userEvent.click(screen.getByTitle("Generate New Travelogue"));
    expect(
      screen.getByRole("checkbox", { name: "Day 1 completed" }),
    ).toBeChecked();
    expect(localStorage.getItem("other-app")).toBe("keep me");
  });

  it("imports a saved journey and updates controls, progress, and storage", async () => {
    const imported = savedJourney(2);
    imported.seed = "imported seed";
    imported.journey = imported.journey.map((day) => ({
      ...day,
      hasPassed: true,
    }));
    saveJourney(savedJourney());
    render(<App />);
    await userEvent.click(
      screen.getByTitle("Import Data From Previous Version"),
    );
    const dialog = await screen.findByRole("dialog", { name: "Import Data" });
    fireEvent.input(within(dialog).getByLabelText("Journey JSON"), {
      target: { value: JSON.stringify({ data: imported }) },
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Import", exact: true }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/Days to Generate/)).toHaveValue(2);
    expect(screen.getByLabelText("Seed:")).toHaveValue("imported seed");
    expect(
      screen.getByRole("checkbox", { name: "Day 2 completed" }),
    ).toBeChecked();
    expect(loadJourney()).toEqual(imported);
  });

  it("shows invalid import errors without changing the saved journey", async () => {
    const original = savedJourney();
    saveJourney(original);
    render(<App />);
    await userEvent.click(
      screen.getByTitle("Import Data From Previous Version"),
    );
    const dialog = await screen.findByRole("dialog", { name: "Import Data" });
    fireEvent.input(within(dialog).getByLabelText("Journey JSON"), {
      target: { value: '{"data":{"seed":1,"dayCount":1,"journey":[{}]}}' },
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Import", exact: true }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid journey data",
    );
    expect(loadJourney()).toEqual(original);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("commits the seed with Enter without treating it as a day count", async () => {
    saveJourney(savedJourney());
    render(<App />);
    await screen.findByRole("checkbox", { name: "Day 1 completed" });
    fireEvent.keyDown(screen.getByLabelText("Seed:"), {
      key: "Enter",
      target: { value: "42" },
    });
    expect(loadJourney()?.seed).toBe("42");
    expect(loadJourney()?.dayCount).toBe(3);
  });

  it("keeps modal keyboard focus inside the dialog and restores it on close", async () => {
    saveJourney(savedJourney());
    render(<App />);
    const trigger = screen.getByTitle("Import Data From Previous Version");
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Import Data" });
    const close = within(dialog).getByRole("button", {
      name: "Close Import Data",
    });
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    expect(dialog).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(cancel).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("opens encounter details and closes with Escape", async () => {
    const saved = savedJourney(10);
    saveJourney(saved);
    render(<App />);
    const index = saved.journey.findIndex((day) => day.encounterDetails);
    expect(index).toBeGreaterThanOrEqual(0);
    await userEvent.click(
      screen.getByRole("button", {
        name: `View encounters for day ${index + 1}`,
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Encounter Details",
    });
    await userEvent.click(within(dialog).getAllByText("Terrain")[0] ?? dialog);
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(document.body).not.toHaveClass("modal-open");
  });

  it("keeps the mobile overlay synchronized and checkbox IDs unique", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      ...window.matchMedia(""),
      matches: true,
    });
    saveJourney(savedJourney());
    const { container } = render(<App />);
    const desktop = await screen.findByRole("checkbox", {
      name: "Day 1 completed",
    });
    await userEvent.click(desktop);
    const mobile = container.querySelector<HTMLInputElement>(
      ".mobile-overlay input",
    );
    expect(mobile).toBeChecked();
    expect(mobile?.id).not.toBe(desktop.id);
  });

  it("keeps unreadable saved data available for recovery", async () => {
    localStorage.setItem(JOURNEY_STORAGE_KEY, "broken JSON");
    render(<App />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "could not be loaded",
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(79);
    expect(localStorage.getItem(JOURNEY_STORAGE_KEY)).toBe("broken JSON");
  });

  it("still allows progress changes when browser storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    render(<App />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "could not be saved",
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Day 1 completed" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Day 1 completed" }),
    ).toBeChecked();
  });
});
