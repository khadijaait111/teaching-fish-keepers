const sessions = new Map<string, { createdAt: number }>();

const TTL = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(): string {
	const token = crypto.randomUUID();
	sessions.set(token, { createdAt: Date.now() });
	return token;
}

export function validateSession(token: string): boolean {
	const session = sessions.get(token);
	if (!session) return false;
	if (Date.now() - session.createdAt > TTL) {
		sessions.delete(token);
		return false;
	}
	return true;
}

export function deleteSession(token: string): void {
	sessions.delete(token);
}
