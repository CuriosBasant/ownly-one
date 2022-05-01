import { Interaction, Utils } from "detritus-client"
import { InteractionCallbackTypes } from "detritus-client/lib/constants"
import { Embed, Markup } from "detritus-client/lib/utils"
import { BaseCommand } from "../command-types/BaseCommand"

export default class StatCommand extends BaseCommand {
  name = "stats"
  description = "Shows the stats of the bot"

  async run(context: Interaction.InteractionContext) {
    const botOwner = context.owners.first()!
    console.log(toTime(process.cpuUsage().user), toTime(process.cpuUsage().system))
    const embed = new Embed()
      .setAuthor(context.me?.nick || context.me?.name, context.me?.avatarUrl)
      .addField("Uptime", Markup.codeblock(toTime(process.cpuUsage().user)), true)
      .addField(
        "Memory Usage",
        Markup.codeblock(
          `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB`
        ),
        true
      )
      .addField("Total Servers", Markup.codeblock(context.client.guilds.size.toString()), true)
      .addField("Total Members", Markup.codeblock(context.client.users.size.toString()), true)
      .setFooter("Developer " + botOwner.tag, botOwner.avatarUrl)

    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: "",
      embed,
    })
  }
}

function toTime(time: number) {
  const mins = (time / 6e7) | 0
  return `${(mins / 60) | 0}hrs ${mins % 60}mins`
}
