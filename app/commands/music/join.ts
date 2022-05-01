import { Constants, Interaction, Structures } from "detritus-client"
import MusicCommandGroup from "../../classes/MusicCommandGroup"

const { ApplicationCommandOptionTypes, Permissions } = Constants

export interface CommandArgs {
  channel: Structures.ChannelGuildVoice
}

export default class JoinCommand extends MusicCommandGroup {
  name = "join"
  description = "Joins the voice channel you're in."
  permissionsClient = [Permissions.CONNECT]

  constructor() {
    super({
      options: [
        new Interaction.InteractionCommandOption({
          default: (context: Interaction.InteractionContext) =>
            context.member?.voiceChannel ?? null,
          value(channel: Structures.Channel, context) {
            return channel.isGuildVoice ? channel : null
          },
        })

          .setName("channel")
          .setDescription("Join this channel instead")
          .setType(ApplicationCommandOptionTypes.CHANNEL),
      ],
    })
  }

  onBefore() {
    return true
  }

  onBeforeRun(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    return Boolean(channel && channel.canJoin)
  }

  async run(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    console.log(channel.name)
    this.joinVoiceChannel(context, channel)
    context.editOrRespond("Joined " + channel.name)
  }

  onCancelRun(context: Interaction.InteractionContext, { channel }: CommandArgs) {
    context.editOrRespond(
      channel
        ? "I don't have permission to join that channel"
        : "You need to specify or join a voice channel."
    )
  }
}
