import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Event } from "../types";
import EventCard from "./EventCard";

describe("EventCard", () => {
	const mockEvent: Event = {
		id: 1,
		title: "Test Event",
		description: "This is a test event description",
		date: "2024-12-25T10:00:00Z",
		end_date: null,
		location: "Test Location",
		image_url: "https://example.com/image.jpg",
		max_participants: 50,
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
	};

	it("should render event title", () => {
		render(<EventCard event={mockEvent} />);
		expect(screen.getByText("Test Event")).toBeInTheDocument();
	});

	it("should render event description", () => {
		render(<EventCard event={mockEvent} />);
		expect(
			screen.getByText("This is a test event description"),
		).toBeInTheDocument();
	});

	it("should render event location", () => {
		render(<EventCard event={mockEvent} />);
		expect(screen.getByText("Test Location")).toBeInTheDocument();
	});

	it("should render formatted date", () => {
		render(<EventCard event={mockEvent} />);
		// The date should be formatted in French locale
		const dateElement = screen.getByText(/mercredi.*décembre.*2024/i);
		expect(dateElement).toBeInTheDocument();
	});

	it("should render image when image_url is provided", () => {
		render(<EventCard event={mockEvent} />);
		const image = screen.getByAltText("Test Event");
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
	});

	it("should not render image when image_url is null", () => {
		const eventWithoutImage = { ...mockEvent, image_url: null };
		render(<EventCard event={eventWithoutImage} />);
		const image = screen.queryByAltText("Test Event");
		expect(image).not.toBeInTheDocument();
	});

	it("should render max participants when provided", () => {
		render(<EventCard event={mockEvent} />);
		expect(screen.getByText("50 participants max")).toBeInTheDocument();
	});

	it("should not render max participants when null", () => {
		const eventWithoutMax = { ...mockEvent, max_participants: null };
		render(<EventCard event={eventWithoutMax} />);
		expect(screen.queryByText(/participants max/)).not.toBeInTheDocument();
	});

	it("should not render location when not provided", () => {
		const eventWithoutLocation = { ...mockEvent, location: "" };
		render(<EventCard event={eventWithoutLocation} />);
		expect(screen.queryByText("Test Location")).not.toBeInTheDocument();
	});
});
