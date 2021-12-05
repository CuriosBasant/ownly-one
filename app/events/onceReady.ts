import { Client } from "discord.js"
import { TEST_SERVER_ID } from "../config"

export default function onceBotReady(bot: Client) {
  console.clear()
  console.log("Bot is Online!")

  bot.guilds.cache.get(TEST_SERVER_ID)!.greetMe("741690056372387902")
}
