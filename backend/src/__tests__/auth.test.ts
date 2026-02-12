import { describe, expect, test } from "bun:test";
import {
	createSession,
	deleteSession,
	validateSession,
} from "../auth/sessions";

describe("Gestion des Sessions Auth", () => {
	test("doit créer et valider une session active", () => {
		const token = createSession();
		expect(token).toBeDefined();
		expect(typeof token).toBe("string");
		const isValid = validateSession(token);
		expect(isValid).toBe(true);
	});

	test("ne doit pas valider un token inexistant", () => {
		const isValid = validateSession("token-imaginaire");
		expect(isValid).toBe(false);
	});

	test("doit invalider la session après suppression", () => {
		const token = createSession();
		deleteSession(token);

		const isValid = validateSession(token);
		expect(isValid).toBe(false);
	});
});
