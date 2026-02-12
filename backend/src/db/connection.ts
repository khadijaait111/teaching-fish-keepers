import postgres from "postgres";

const sql = postgres({
	host: process.env.PGHOST ?? "localhost",
	port: Number(process.env.PGPORT ?? 5432),
	database: process.env.PGDATABASE ?? "clubpoisson",
	username: process.env.PGUSER ?? "clubpoisson",
	password: process.env.PGPASSWORD ?? "clubpoisson",
});

export default sql;
