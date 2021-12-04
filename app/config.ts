if (!process.env.BOT_ID) {
  throw new Error("Some envs are not set")
}
export const BOT_PREFIX = process.env.BOT_PREFIX ?? ";"
export const BOT_TOKEN = process.env.BOT_TOKEN!
export const BOT_ID = process.env.BOT_ID!
export const OWNER_ID = "446194045614555138"
export const TEST_SERVER_ID = "489868834828976139"
export const SERVER_INVITE_LINK = "https://discord.gg/uW82j6S"
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!

/* 
"scripts": {
    "local": "tsc && node -r dotenv/config .",
    "build": "tsc",
    "watch:dev": "concurrently \"yarn watch\" \"yarn dev\"",
    "watch": "tsc -w",
    "test": "nodemon src/classes/test.ts",
    "dev": "nodemon -r dotenv/config ."
  },
*/
