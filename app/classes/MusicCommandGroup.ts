import { Constants, Interaction } from "detritus-client"
import { InteractionCallbackTypes } from "detritus-client/lib/constants"
import { BaseCommand } from "../command-types/BaseCommand"

const { Permissions } = Constants

export default abstract class MusicCommandGroup extends BaseCommand {
  permissionsClient = [Permissions.CONNECT, Permissions.SPEAK]
  disableDm = true

  onBefore(context: Interaction.InteractionContext) {
    const memberVC = context.member?.voiceChannel

    return !!memberVC
  }

  async joinVoiceChannel(context: Interaction.InteractionContext, channel = context.voiceChannel) {
    if (!channel) return null

    const botVC = context.me?.voiceChannel

    if (!botVC || botVC == channel || botVC.members.every((member) => member.bot)) {
      context.respond(InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
      // context.client.voiceConnect(context.guildId, context.channelId)
      return channel.join({ wait: true, opusEncoder: false })
    } else {
      context.editOrRespond("I'm already being used in some other voice channel")
      return null
    }
  }

  onCancel(context: Interaction.InteractionContext) {
    context.editOrRespond("You need to be in a voice channel to use that command")
  }
}
