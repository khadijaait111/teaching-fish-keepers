import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "./useAuth";

// Mock the auth API - hoisted mocks using vi.hoisted()
const { mockLogin, mockCheckAuth, mockLogout } = vi.hoisted(() => ({
	mockLogin: vi.fn(),
	mockCheckAuth: vi.fn(),
	mockLogout: vi.fn(),
}));

vi.mock("../api/auth", () => ({
	login: mockLogin,
	checkAuth: mockCheckAuth,
	logout: mockLogout,
}));

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("should throw error when used outside AuthProvider", () => {
		// Suppress console.error for this test
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			renderHook(() => useAuth());
		}).toThrow("useAuth must be used within AuthProvider");

		consoleSpy.mockRestore();
	});

	it("should return auth context when used within AuthProvider", async () => {
		mockCheckAuth.mockResolvedValue({ authenticated: false });

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current).toHaveProperty("token");
		expect(result.current).toHaveProperty("isAuthenticated");
		expect(result.current).toHaveProperty("loading");
		expect(result.current).toHaveProperty("login");
		expect(result.current).toHaveProperty("logout");
	});

	it("should initialize with token from localStorage if authenticated", async () => {
		const token = "stored-token-123";
		localStorage.setItem("club_poisson_token", token);
		mockCheckAuth.mockResolvedValue({ authenticated: true });

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.token).toBe(token);
		});

		expect(result.current.isAuthenticated).toBe(true);
		expect(mockCheckAuth).toHaveBeenCalledWith(token);
	});

	it("should remove invalid token from localStorage", async () => {
		const token = "invalid-token";
		localStorage.setItem("club_poisson_token", token);
		mockCheckAuth.mockResolvedValue({ authenticated: false });

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.token).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
		expect(localStorage.getItem("club_poisson_token")).toBeNull();
	});

	it("should handle login successfully", async () => {
		const token = "new-token-456";
		mockCheckAuth.mockResolvedValue({ authenticated: false });
		mockLogin.mockResolvedValue({ token });

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		let error: string | null = null;
		await act(async () => {
			error = await result.current.login("password123");
		});

		expect(error).toBeNull();
		await waitFor(() => {
			expect(result.current.token).toBe(token);
		});
		expect(result.current.isAuthenticated).toBe(true);
		expect(localStorage.getItem("club_poisson_token")).toBe(token);
	});

	it("should handle login failure", async () => {
		const errorMessage = "Invalid password";
		mockCheckAuth.mockResolvedValue({ authenticated: false });
		mockLogin.mockResolvedValue({ error: errorMessage });

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const error = await result.current.login("wrong-password");

		expect(error).toBe(errorMessage);
		expect(result.current.token).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("should handle logout", async () => {
		const token = "token-to-logout";
		localStorage.setItem("club_poisson_token", token);
		mockCheckAuth.mockResolvedValue({ authenticated: true });
		mockLogout.mockResolvedValue(undefined);

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.token).toBe(token);
		});

		await act(async () => {
			await result.current.logout();
		});

		await waitFor(() => {
			expect(result.current.token).toBeNull();
		});
		expect(result.current.isAuthenticated).toBe(false);
		expect(localStorage.getItem("club_poisson_token")).toBeNull();
		expect(mockLogout).toHaveBeenCalledWith(token);
	});
});
