import { Interaction } from "detritus-client"
import { BaseCommand } from "../../command-types/BaseCommand"

export default class PingCommand extends BaseCommand {
  name = "ping"
  description = "Ping ka jawab Pong se dena"

  async run(context: Interaction.InteractionContext) {
    const { gateway, rest } = await context.client.ping()
    const botVC = context.me?.voiceChannel
    return context.editOrRespond(`pong! (gateway: ${gateway}ms) (rest: ${rest}ms) ${String(botVC)}`)
  }
}
