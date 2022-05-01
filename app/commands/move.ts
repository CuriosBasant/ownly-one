import { Constants, Interaction, Structures } from "detritus-client"
import { BaseCommand } from "../command-types/BaseCommand"
import { emojies } from "../constants"

const { ApplicationCommandOptionTypes, Permissions } = Constants

export interface CommandArgs {
  source_channel: Structures.ChannelGuildVoice
  target_channel: Structures.ChannelGuildVoice
}

export default class MoveCommand extends BaseCommand {
  name = "move"
  description = "Moves all members to another voice channel"
  permissions = [Permissions.MOVE_MEMBERS]
  // permissionsClient = [Permissions.MOVE_MEMBERS]

  constructor() {
    super()
    this.options = [
      new Interaction.InteractionCommandOption()
        .setName("target_channel")
        .setRequired(true)
        .setDescription("The target channel to move to")
        .setType(ApplicationCommandOptionTypes.CHANNEL),
      new Interaction.InteractionCommandOption({
        default: (context: Interaction.InteractionContext) => context.member?.voiceChannel ?? null,
      })
        .setName("source_channel")
        .setDescription("The target channel to move to")
        .setType(ApplicationCommandOptionTypes.CHANNEL),
    ]
  }
  // onBefore(context: Interaction.InteractionContext) {
  //   return Boolean(context.member?.voiceChannel)
  // }
  onBeforeRun(
    context: Interaction.InteractionContext,
    { source_channel, target_channel }: CommandArgs
  ) {
    return source_channel && target_channel.canMoveMembers
  }

  async run(
    context: Interaction.InteractionContext,
    { source_channel, target_channel }: CommandArgs
  ) {
    console.log(target_channel.name)
    if (source_channel.members.size == 0) {
      context.editOrRespond(`The source channel ${source_channel.mention} has no members to move`)
      return
    }

    context.editOrRespond(`${emojies.loading} Moving all members to ${target_channel.mention}`)
    const prom: any[] = []
    for (const [_, member] of source_channel.members) {
      prom.push(member.move(target_channel.id))
    }
    await Promise.all(prom)
    context.editOrRespond(
      `Successfully moved all members of ${source_channel.mention} to ${target_channel.mention}!`
    )
  }

  onCancelRun(
    context: Interaction.InteractionContext,
    { source_channel, target_channel }: CommandArgs
  ) {
    context.editOrRespond(
      !source_channel
        ? "You need to be either in a voice channel or provide a channel to move members from."
        : "Either the provided channel is not a voice channel, or I don't have permission to move members in that voice channel"
    )
  }
  // onCancel(context: Interaction.InteractionContext) {
  //   context.editOrRespond("You need to be ")
  // }
}
