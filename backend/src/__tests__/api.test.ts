import { describe, expect, test } from "bun:test";

const BASE_URL = "http://localhost:3000/api";

describe("Tests des points d'entrée API", () => {
	describe("Événements Publics", () => {
		test("GET /events doit retourner 200 et un tableau", async () => {
			const response = await fetch(`${BASE_URL}/events`);
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(Array.isArray(data)).toBe(true);
		});

		test("GET /events/:id avec un ID inexistant doit retourner 404", async () => {
			const response = await fetch(`${BASE_URL}/events/99999`);
			expect(response.status).toBe(404);
		});
	});

	describe("Authentification & Sécurité", () => {
		test("POST /auth/login avec un mauvais mot de passe doit retourner 401", async () => {
			const response = await fetch(`${BASE_URL}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "test@test.com",
					password: "mauvais_password",
				}),
			});

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe("Invalid password");
		});

		test("L'accès aux routes protégées sans token doit retourner 401", async () => {
			const response = await fetch(`${BASE_URL}/events`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Hack" }),
			});

			expect(response.status).toBe(401);
		});
	});
});
