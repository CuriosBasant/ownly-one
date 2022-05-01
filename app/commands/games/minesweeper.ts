import { Constants, Interaction, Structures, Utils } from "detritus-client"
import {
  ApplicationCommandOptionTypes,
  InteractionCallbackTypes,
  MessageComponentButtonStyles,
} from "detritus-client/lib/constants"
import GameCommandGroup from "../../classes/GameCommandGroup"
import Minesweeper, { TileType } from "../../classes/Minesweeper"
import { emojies } from "../../constants"
import { sendConfirmationDialog } from "../../functions/sendConfirmationDialog"
import { EMPTY_CHAR, getRowCol } from "../../utils"

const FIVE = 5
export default class MinesweeperCommand extends GameCommandGroup {
  name = "minesweeper"
  description = "Play minesweeper"

  // onBeforeRun(context: Interaction.InteractionContext, { opponent }: CommandArgs) {
  //   return sendConfirmationDialog(
  //     context,
  //     opponent,
  //     `Hey ${opponent.mention}, do you accept the TicTacToe Challenge from **${
  //       context.member!.name
  //     }**`
  //   )
  // }

  async run(context: Interaction.InteractionContext) {
    const components = [...Array(FIVE)].map(
        (_, r, arr) =>
          new Utils.ComponentActionRow({
            components: arr.map((_, c) =>
              new Utils.ComponentButton()
                .setCustomId(r + "_" + c)
                .setLabel(EMPTY_CHAR)
                .setStyle(MessageComponentButtonStyles.SUCCESS)
            ),
          })
      ),
      embed = new Utils.Embed().setAuthor("Minesweeper Game", context.client.user?.avatarUrl)
    // .setTitle(`${context.user.name} vs ${opponent.user.name}`)
    // .setFooter(`${context.user.name}'s Turn`, context.user.avatarUrl)

    const message = await context
        .editOrRespond({
          // content: `${opponent.name} has accepted the challenge`,
          components,
          embed,
        })
        .then(() => context.fetchResponse()),
      minesweeper = new Minesweeper(FIVE)

    function updateComponents() {
      console.log(minesweeper.arena)
      for (let r = 0; r < minesweeper.ROW; r++) {
        for (let c = 0; c < minesweeper.COL; c++) {
          const tile = minesweeper.arena[r][c]
          const button = <Utils.ComponentButton>components[r].components[c]
          if (typeof tile == "number") {
            button
              .setEmoji(emojies[tile])
              .setStyle(MessageComponentButtonStyles.PRIMARY)
              .setDisabled(true)
          } else
            switch (tile) {
              case TileType.HIDDEN:
              case TileType.HIDDEN_MINE:
                break
              case TileType.EXPLORED:
                button.setDisabled(true).setStyle(MessageComponentButtonStyles.SECONDARY)
                break
              case TileType.MINE_REVEALED:
                button
                  .setEmoji(emojies.bomb)
                  .setStyle(MessageComponentButtonStyles.DANGER)
                  .setDisabled(true)
                break
              case TileType.MINE:
                button.setEmoji(emojies.boom).setStyle(MessageComponentButtonStyles.DANGER)
                break

              default:
                break
            }
        }
      }
    }

    minesweeper
      .on("start", () => {})
      .on("move", () => {
        updateComponents()
        // button.disabled = true
        // const currentUser = minesweeper.firstTurn ? context.user : opponent.user
        // embed.setFooter(`${currentUser.name}'s Turn`, currentUser.avatarUrl)
        context.editResponse({
          components,
          embed,
        })
      })
      .on("finish", (reason) => {
        updateComponents()
        const currentUser = context.user
        if (reason == "mine") {
          // embed.setFooter(`${currentUser.name} Won!`, currentUser.avatarUrl)
          context.createMessage(
            `**Ka-BoOOM** ${emojies.boom}, you just exploded a mine **${currentUser.name}**. **Game Over**`
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
        minesweeper.removeAllListeners()
        context.cluster!.off("messageComponentInteraction", interactionComponentListener)
      })

    const interactionComponentListener = (interaction: Structures.Interaction) => {
      if (interaction.message!.id != message.id) return

      const data = interaction.data as Structures.InteractionDataComponent
      const index = customIdToIndex(data.customId)

      if (context.user == interaction.user || interaction.client.isOwner(interaction.userId)) {
        minesweeper.revealTile(index)
        interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
      } else {
        interaction.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
          // flags: MessageFlags.EPHEMERAL,
          content: "You are not playing this game.",
        })
      }
    }
    context.cluster!.on("messageComponentInteraction", interactionComponentListener)
  }

  onCancelRun(context: Interaction.InteractionContext) {
    // context.editOrRespond(`${opponent.name} has declined the challenge.`)
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
  const index = +r * FIVE + +c
  return isNaN(index) ? -1 : index
}
