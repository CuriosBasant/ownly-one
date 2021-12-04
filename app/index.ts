import { Client, Intents } from "discord.js"
import { BOT_TOKEN, TEST_SERVER_ID } from "./config"
import "./extensions"

const bot = new Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES],
})

bot.once("ready", () => {
  console.clear()
  console.log("Bot is Online!")

  bot.guilds.cache.get(TEST_SERVER_ID)!.greetMe("741690056372387902")
})

bot.login(BOT_TOKEN)

/* 
const bot = new OwnlyClient({
  ownerId: OWNER_ID,
  intents: [
    
    Intents.FLAGS.GUILD_MESSAGES,
  ],
})
bot.registerEventsIn("events", { bot, musicPlayers: new Collection(), db: {} })
bot.registerCommandsIn("commands").then(() => bot.deployCommands())
collections.users
  .doc("interaction.user.id")
  .set(
    {
      coins: FieldValue.increment(10),
      dailyStreak: {
        count: FieldValue.increment(1),
        lastIncrementTime: FieldValue.serverTimestamp(),
      },
    },
    { merge: true }
  )
  .catch(console.log)
bot.once("ready", () => {
  // console.clear()
  console.log("Bot is Online!")
})
 */
