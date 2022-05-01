import { Constants, Interaction, Structures } from "detritus-client"
import GameCommandGroup from "../../classes/GameCommandGroup"

const { ApplicationCommandOptionTypes, Permissions } = Constants

export interface CommandArgs {
  gamename: "tictactoe"
}

export default class SeekCommand extends GameCommandGroup {
  name = "seek"
  description = "Seek games from other servers"

  constructor() {
    super()
    this.options = [
      new Interaction.InteractionCommandOption()
        .setName("gamename")
        .setDescription("Which game you want to play?")
        .setChoices([{ name: "TicTacToe", value: "tictactoe" }])
        .setType(ApplicationCommandOptionTypes.STRING),
    ]
  }

  onBeforeRun(context: Interaction.InteractionContext, { gamename }: CommandArgs) {
    return Boolean(gamename)
  }

  async run(context: Interaction.InteractionContext, { gamename }: CommandArgs) {
    context.editOrRespond(`Lets play ${gamename}`)
  }

  onCancelRun(context: Interaction.InteractionContext, { gamename }: CommandArgs) {
    context.editOrRespond(
      gamename
        ? "I don't have permission to join that channel"
        : "You need to specify or join a voice channel."
    )
  }
}
