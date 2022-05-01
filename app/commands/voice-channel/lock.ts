import { Interaction } from "detritus-client"
import { BaseCommand } from "../../command-types/BaseCommand"

export default class LockVCCommand extends BaseCommand {
  name = "lock"
  description = "Locks the voice channel you're in"

  onBefore(context: Interaction.InteractionContext) {
    return Boolean(context.member?.voiceChannel)
  }

  onBeforeRun(context: Interaction.InteractionContext) {
    const memberchannel = context.member?.voiceChannel!
    // is channel owner
    return context.cluster!.metadata.tempChannels.get(memberchannel.id) == context.member
  }

  async run(context: Interaction.InteractionContext) {
    const memberchannel = context.member?.voiceChannel!
    memberchannel.edit({
      locked: true,
    })
    return context.editOrRespond(`pong!`)
  }
}
