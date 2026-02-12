import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock localStorage with actual storage implementation
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string): string | null => {
			return store[key] || null;
		},
		setItem: (key: string, value: string): void => {
			store[key] = value.toString();
		},
		removeItem: (key: string): void => {
			delete store[key];
		},
		clear: (): void => {
			store = {};
		},
		get length(): number {
			return Object.keys(store).length;
		},
		key: (index: number): string | null => {
			const keys = Object.keys(store);
			return keys[index] || null;
		},
	};
})();

Object.defineProperty(globalThis, "localStorage", {
	value: localStorageMock,
	writable: true,
	configurable: true,
});

// Mock fetch globally
vi.stubGlobal("fetch", vi.fn());

// Reset mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
	localStorageMock.clear();
});
