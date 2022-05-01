import { Constants, Interaction, Structures } from "detritus-client"
import { ApplicationCommandOptionTypes } from "detritus-client/lib/constants"
import { BaseCommand, BaseCommandOption } from "../../command-types/BaseCommand"
import { startStalking, stopStalking } from "../../functions/stalking"

export interface CommandArgs {
  user: Structures.User
}

export default class StalkCommand extends BaseCommand {
  name = "stalk"
  description = "Stalk a user"

  constructor() {
    super()
    this.options = [new StartSubCommand(), new StopSubCommand(), new ListSubCommand()]
  }

  async run(context: Interaction.InteractionContext, { user }: CommandArgs) {
    context.editOrRespond(`Lets play ${user}`)
  }
}

class StartSubCommand extends BaseCommandOption {
  name = "start"
  description = "Start stalking someone."

  constructor() {
    super({
      options: [
        {
          name: "user",
          description: "Whom you want to start stalking?",
          required: true,
          type: ApplicationCommandOptionTypes.USER,
        },
      ],
    })
  }

  async run(context: Interaction.InteractionContext, { user }) {
    const ho = await startStalking(context.user, user)
    console.log(ho)
  }
}

class StopSubCommand extends BaseCommandOption {
  name = "stop"
  description = "Whom you want to stop stalk?"

  constructor() {
    super({
      options: [
        {
          name: "user",
          description: "Whom you want to stop stalk?",
          required: true,
          type: ApplicationCommandOptionTypes.USER,
        },
      ],
    })
  }

  async run(context: Interaction.InteractionContext, { user }) {
    const ho = await stopStalking(context.user, user)
    console.log(ho)
  }
}
class ListSubCommand extends BaseCommandOption {
  name = "list"
  description = "See your stalk list"

  constructor() {
    super({
      options: [
        {
          name: "user",
          description: "Whom you want to stop stalk?",
          required: true,
          type: ApplicationCommandOptionTypes.USER,
        },
      ],
    })
  }

  async run(context: Interaction.InteractionContext) {
    context.editOrRespond("This is your stalk list")
  }
}
