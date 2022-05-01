import { Constants, Interaction, Structures } from "detritus-client"
import { BaseCommand } from "../../command-types/BaseCommand"
import { firestore } from "../../firebase"
import { createMasterChannel } from "../../functions/handleVoiceChannelGeneration"

export interface CommandArgs {
  channel: Structures.ChannelGuildVoice
}

export default class SetupVCCommand extends BaseCommand {
  name = "setup"
  description = "Setups a VC"
  permissions = [Constants.Permissions.MANAGE_CHANNELS]
  permissionsClient = [Constants.Permissions.MANAGE_CHANNELS]

  constructor() {
    super({
      options: [
        new Interaction.InteractionCommandOption({
          default: (context: Interaction.InteractionContext) =>
            context.member?.voiceChannel ?? null,
          value(channel: Structures.Channel, context) {
            return channel.isGuildCategory || channel.isGuildVoice ? channel : null
          },
        })
          .setName("channel")
          .setDescription("Setup up this vc")
          .setType(Constants.ApplicationCommandOptionTypes.CHANNEL),
      ],
    })
  }

  onBeforeRun(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    return Boolean(channel)
  }

  async run(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    const masterChannel = channel.isGuildCategory
      ? await createMasterChannel(channel.guild!, channel.id!)
      : channel

    context.editOrRespond(
      `I have been successfully binded with the master channel <#${masterChannel.id}> with id ${
        masterChannel.id
      }, in ${masterChannel.parent!.name}`
    )
  }

  onCancelRun(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    context.editOrRespond("You need to specify a category or voice channel")
  }
}
