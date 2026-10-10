import { fireEvent, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import WeatherIcon from "./weather-icon";
import type { Weather } from "./types";

const cases: { weather: Weather; label: string; description: string }[] = [
  {
    weather: "sunny",
    label: "Sunny",
    description: "Sunny, clear skies - proceed as normal.",
  },
  {
    weather: "light-rain",
    label: "Light Rain",
    description: "Occasional light rain - roll 1d4 for inches of rain.",
  },
  {
    weather: "heavy-rain",
    label: "Heavy Rain",
    description:
      "Heavy rain - visibility limited to 150ft, roll 1d4+2 for inches of rain.",
  },
  {
    weather: "storm",
    label: "Tropical Storm",
    description:
      "Tropical storm - travel by canoe impossible, travel on foot gains 1 level of exhaustion if DC 15 Constitution save is failed. Disadvantage on checks to avoid becoming lost. 8 inches of rain.",
  },
];

describe("weather tooltips", () => {
  it.each(cases)(
    "shows the exact $label rules on hover",
    async ({ weather, label, description }) => {
      render(<WeatherIcon weather={weather} dayNumber={3} />);
      const icon = screen.getByRole("button", {
        name: `${label} weather for day 3`,
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      await userEvent.hover(icon);
      expect(screen.getByRole("tooltip").textContent).toBe(description);
      expect(icon).toHaveAccessibleDescription(description);
      await userEvent.unhover(icon);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    },
  );

  it("shows rules on keyboard focus and dismisses them with Escape or blur", async () => {
    render(<WeatherIcon weather="storm" dayNumber={1} />);
    const icon = screen.getByRole("button");
    await userEvent.tab();
    expect(icon).toHaveFocus();
    expect(screen.getByRole("tooltip")).toHaveTextContent("DC 15 Constitution");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.click(icon);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await userEvent.unhover(icon);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("dismisses a tooltip when its row scrolls or the viewport changes", async () => {
    render(<WeatherIcon weather="light-rain" dayNumber={1} />);
    const icon = screen.getByRole("button");
    await userEvent.hover(icon);
    fireEvent.scroll(document);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.unhover(icon);
    await userEvent.hover(icon);
    fireEvent.resize(window);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("gives tooltips in different rows unique accessible descriptions", async () => {
    render(
      <>
        <WeatherIcon weather="sunny" dayNumber={1} />
        <WeatherIcon weather="storm" dayNumber={2} />
      </>,
    );
    const sunny = screen.getByRole("button", {
      name: "Sunny weather for day 1",
    });
    const storm = screen.getByRole("button", {
      name: "Tropical Storm weather for day 2",
    });
    await userEvent.tab();
    await userEvent.hover(storm);
    expect(screen.getAllByRole("tooltip")).toHaveLength(2);
    expect(sunny.getAttribute("aria-describedby")).not.toBe(
      storm.getAttribute("aria-describedby"),
    );
    expect(sunny).toHaveAccessibleDescription(cases[0]?.description);
    expect(storm).toHaveAccessibleDescription(cases[3]?.description);
  });
});
