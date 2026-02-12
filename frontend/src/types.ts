export interface Event {
	id: number;
	title: string;
	description: string;
	date: string;
	end_date: string | null;
	location: string;
	image_url: string | null;
	max_participants: number | null;
	created_at: string;
	updated_at: string;
}

export interface EventInput {
	title: string;
	description?: string;
	date: string;
	end_date?: string | null;
	location?: string;
	image_url?: string | null;
	max_participants?: number | null;
}
