import { Guild, Snowflake, TextChannel } from "discord.js"

declare module "discord.js" {
  interface Guild {
    greetMe: (channelId: Snowflake) => Promise<Message>
  }
}

Guild.prototype.greetMe = async function (id) {
  const channel = (await this.channels.fetch(id)) as TextChannel

  return channel.send("Hello, Basant")
}
