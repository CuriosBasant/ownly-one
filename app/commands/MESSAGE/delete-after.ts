import { Interaction, Structures } from "detritus-client"
import { InteractionCallbackTypes, MessageFlags, Permissions } from "detritus-client/lib/constants"
import { BaseMessageCommand } from "../../command-types/BaseCommand"

export interface CommandArgs {
  message: Structures.Message
}

export default class DeleteAfterCommand extends BaseMessageCommand {
  name = "deleteafter"
  permissions = [Permissions.MANAGE_MESSAGES]
  permissionsClient = [Permissions.MANAGE_MESSAGES]

  async run(context: Interaction.InteractionContext, { message }: CommandArgs) {
    const messageAfter = await context.rest.fetchMessages(message.channelId, {
      after: message.id,
      limit: 100,
    })
    const deletable: string[] = [],
      before14Days = Date.now() - 14 * 24 * 60 * 60 * 1000
    for (const [_, msg] of messageAfter) {
      if (msg.timestampUnix > before14Days) deletable.push(msg.id)
    }

    if (!deletable.length) {
      return context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
        content: "Messages older than 14 days can't be bulk deleted",
        flags: MessageFlags.EPHEMERAL,
      })
    }

    await context.rest.bulkDeleteMessages(message.channelId, deletable)

    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: `Successfully deleted ${deletable.length} messages from this channel`,
      flags: MessageFlags.EPHEMERAL,
    })
  }
}
