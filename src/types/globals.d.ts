declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			CLIENT_ID: string;
			CLIENT_SECRET: string;
			MONGO_URI: string;
			DATABASE_NAME: string;
			REDIS_URL: string;
		};
	}
}

export { };