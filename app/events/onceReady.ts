import { Client } from "discord.js"
import { TEST_SERVER_ID } from "../config"

export default function onceBotReady(this: Client) {
  console.clear()
  console.log("Bot is Online!")

  this.guilds.cache.get(TEST_SERVER_ID)!.greetMe("741690056372387902")
}
