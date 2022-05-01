import { Constants, Interaction, Structures, Utils } from "detritus-client"
import {
  ApplicationCommandOptionTypes,
  InteractionCallbackTypes,
  MessageComponentButtonStyles,
} from "detritus-client/lib/constants"
import GameCommandGroup from "../../classes/GameCommandGroup"
import TicTacToe, { TileType } from "../../classes/TicTacToe"
import { emojies } from "../../constants"
import { sendConfirmationDialog } from "../../functions/sendConfirmationDialog"
import { EMPTY_CHAR, getRowCol } from "../../utils"

export interface CommandArgs {
  opponent: Structures.Member
}
const THREE = 3
export default class TicTacToeCommand extends GameCommandGroup {
  name = "tictactoe"
  description = "Play tictactoe with server mates"

  constructor() {
    super({
      options: [
        new Interaction.InteractionCommandOption()
          .setRequired(true)
          .setName("opponent")
          .setDescription("Mention a user to play with")
          .setType(ApplicationCommandOptionTypes.USER),
      ],
    })
  }

  // onBeforeRun(context: Interaction.InteractionContext, { opponent }: CommandArgs) {
  //   return sendConfirmationDialog(
  //     context,
  //     opponent,
  //     `Hey ${opponent.mention}, do you accept the TicTacToe Challenge from **${
  //       context.member!.name
  //     }**`
  //   )
  // }

  async run(context: Interaction.InteractionContext, { opponent }: CommandArgs) {
    try {
      const accepted = await sendConfirmationDialog(
        context,
        opponent,
        `Hey ${opponent.mention}, do you accept the TicTacToe Challenge from **${
          context.member!.name
        }**`
      )
      if (!accepted) {
        return context.editOrRespond(`**${opponent.name}** declined the challenge.`)
      }
    } catch (error) {
      return context.editOrRespond(`**${opponent.name}** has not responded!`)
    }

    const components = [...Array(THREE)].map(
        (_, r, arr) =>
          new Utils.ComponentActionRow({
            components: arr.map((_, c) =>
              new Utils.ComponentButton()
                .setCustomId(r + "_" + c)
                .setLabel(EMPTY_CHAR)
                .setStyle(MessageComponentButtonStyles.SECONDARY)
            ),
          })
      ),
      embed = new Utils.Embed()
        .setAuthor("TicTacToe Game", context.client.user?.avatarUrl)
        .setTitle(`${context.user.name} vs ${opponent.user.name}`)
        .setFooter(`${context.user.name}'s Turn`, context.user.avatarUrl)

    const message = await context
        .editOrRespond({
          content: `${opponent.name} has accepted the challenge`,
          components,
          embed,
        })
        .then(() => context.fetchResponse()),
      tictactoe = new TicTacToe()

    function updateComponents(index: number) {
      const [row, col] = getRowCol(index, 2)
      const button = <Utils.ComponentButton>components[row].components[col]
      button.style =
        tictactoe.arena[index] == TileType.CROSS
          ? MessageComponentButtonStyles.SUCCESS
          : MessageComponentButtonStyles.DANGER
    }

    tictactoe
      .on("start", () => {})
      .on("move", () => {
        updateComponents(tictactoe.lastIndex)
        // button.disabled = true
        const currentUser = tictactoe.firstTurn ? context.user : opponent.user
        embed.setFooter(`${currentUser.name}'s Turn`, currentUser.avatarUrl)
        context.editResponse({
          components,
          embed,
        })
      })
      .on("finish", (reason) => {
        updateComponents(tictactoe.lastIndex)
        const currentUser = tictactoe.firstTurn ? context.user : opponent.user
        if (reason == "win") {
          embed.setFooter(`${currentUser.name} Won!`, currentUser.avatarUrl)
          context.createMessage(
            `Congo ${emojies.clap}, **${currentUser.name}**, you WON. Big Brains! ${emojies.brain}`
          )
        } else if (reason == "draw") {
          embed.setFooter("Game Drawn!", currentUser.avatarUrl)
          context.createMessage(`${emojies.eyes} Looks like the game has been drawn.`)
        }

        context.editResponse({
          components,
          embed,
        })
        console.log(reason)
        tictactoe.removeAllListeners()
        context.cluster!.off("messageComponentInteraction", interactionComponentListener)
      })

    const interactionComponentListener = (interaction: Structures.Interaction) => {
      // console.log("chala", interaction.message!.id)
      if (interaction.message!.id != message.id) return

      const data = interaction.data as Structures.InteractionDataComponent
      const index = customIdToIndex(data.customId)

      if (
        (tictactoe.firstTurn ? context.user : opponent.user) == interaction.user ||
        interaction.client.isOwner(interaction.userId)
      ) {
        tictactoe.move(index)
        interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
      } else if ((!tictactoe.firstTurn ? context.user : opponent.user) == interaction.user) {
        interaction.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
          // flags: MessageFlags.EPHEMERAL,
          content: "It's not your turn!",
        })
      } else {
        interaction.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
          // flags: MessageFlags.EPHEMERAL,
          content: "You are not playing this game.",
        })
      }
    }
    context.cluster!.on("messageComponentInteraction", interactionComponentListener)
  }

  onCancelRun(context: Interaction.InteractionContext, { opponent }: CommandArgs) {
    context.editOrRespond(`${opponent.name} has declined the challenge.`)
  }
}
// context.client.cluster!.metadata.collectors.set(
//   message.id,
//   (interaction: Structures.Interaction) => {
//     console.log(interaction.data)
//   }
// )
// addComponentListener(message, () => {})

function customIdToIndex(id: string) {
  const [r, c] = id.split("_")
  const index = +r * THREE + +c
  return isNaN(index) ? -1 : index
}
