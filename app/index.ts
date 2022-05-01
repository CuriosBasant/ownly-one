import { ClusterClient, Constants, InteractionCommandClient } from "detritus-client"
import { BaseCollection } from "detritus-client/lib/collections"
import { ActivityTypes, GatewayIntents, PresenceStatuses } from "detritus-client/lib/constants"
import { BOT_TOKEN, TEST_SERVER_ID } from "./config"
import { getAndParseEventsIn } from "./utils"

new InteractionCommandClient(BOT_TOKEN, {
  useClusterClient: true,

  gateway: {
    intents: [
      GatewayIntents.DIRECT_MESSAGES,
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MEMBERS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.GUILD_MESSAGE_REACTIONS,
      GatewayIntents.GUILD_VOICE_STATES,
    ],
    presence: {
      activity: { name: `detritus smashing mahead`, type: ActivityTypes.WATCHING },
      status: PresenceStatuses.IDLE,
    },
  },
})
  .run({ directories: ["commands"] })

  .then(async (bot) => {
    // await bot.rest.bulkOverwriteApplicationGuildCommands(bot.applicationId, TEST_SERVER_ID, [])
    // await bot.rest.bulkOverwriteApplicationCommands(bot.applicationId, [])
    ;(bot as ClusterClient).metadata = {
      collectors: new BaseCollection(),
      tempChannels: new BaseCollection(),
    }
    // bot.on("mer", ({ message }) => console.log(message.content))
    const events = await getAndParseEventsIn("events")
    for (const event in events) {
      const listener = events[event].bind(bot)
      bot.on(event, listener)
    }

    console.log("Bot Started!")
  })
  .catch(({ errors, ...rest }) => {
    console.error(JSON.stringify(errors, null, 2), rest)
  })

/*  
  kal ho na ho
  chukar mere man ko
  ehsan tera hoga
  pehla nasha
*/
