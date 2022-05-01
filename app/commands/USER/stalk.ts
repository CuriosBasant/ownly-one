import { Interaction, Structures } from "detritus-client"
import { InteractionCallbackTypes, MessageFlags } from "detritus-client/lib/constants"
import { BaseUserCommand } from "../../command-types/BaseCommand"
import { startStalking } from "../../functions/stalking"

export interface CommandArgs {
  member: Structures.Member
  user: Structures.User
}

export default class StalkUserCommand extends BaseUserCommand {
  name = "stalk"

  async run(context: Interaction.InteractionContext, { member }: CommandArgs) {
    const done = await startStalking(context.user, member.user)
    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: done
        ? `You've now started stalking to, ${member}`
        : `You might be already stalking ${member}, don't know`,
      flags: MessageFlags.EPHEMERAL,
    })
  }
}
