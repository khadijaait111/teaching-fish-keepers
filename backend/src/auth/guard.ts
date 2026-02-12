import { extractBearerToken } from "./routes.ts";
import { validateSession } from "./sessions.ts";

export function requireAuth(req: Request): Response | null {
	const token = extractBearerToken(req);
	if (!token || !validateSession(token)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	return null;
}
