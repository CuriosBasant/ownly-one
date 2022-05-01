import { Interaction, Structures } from "detritus-client"
import {
  InteractionCallbackTypes,
  MessageComponentButtonStyles,
} from "detritus-client/lib/constants"
import { ComponentActionRow, ComponentButton, Embed } from "detritus-client/lib/utils"
import GameCommandGroup from "../../classes/GameCommandGroup"
import Puzzle16 from "../../classes/Puzzle16"
import { emojies } from "../../constants"
import { EMPTY_CHAR, getRowCol } from "../../utils"

const FOUR = 4
export default class Puzzle16Command extends GameCommandGroup {
  name = "puzzle16"
  description = "Play Puzzle"

  async run(context: Interaction.InteractionContext) {
    const components = [...Array(FOUR)].map(
        (_, r, arr) =>
          new ComponentActionRow({
            components: arr.map((_, c) =>
              new ComponentButton()
                .setCustomId(r + "_" + c)
                // .setLabel(EMPTY_CHAR)
                .setStyle(MessageComponentButtonStyles.PRIMARY)
            ),
          })
      ),
      embed = new Embed().setAuthor("Playing Puzzle16 Game", context.client.user?.avatarUrl),
      puzzle = new Puzzle16(FOUR).shuffle()

    const emptyButton = new ComponentButton()
      .setCustomId("empty")
      .setLabel(EMPTY_CHAR)
      .setStyle(MessageComponentButtonStyles.SECONDARY)
      .setDisabled(true)
    //make last button none
    // ;(components.at(-1)!.components.at(-1) as ComponentButton)
    //   .setStyle(MessageComponentButtonStyles.SECONDARY)
    //   .setDisabled(true)

    updateComponents()
    const message = await context
      .editOrRespond({
        // content: `${opponent.name} has accepted the challenge`,
        components,
        embed,
      })
      .then(() => context.fetchResponse())

    function updateComponents(lastEmpty?: number) {
      console.log(puzzle.position)
      for (let i = 0; i < puzzle.position.length; i++) {
        const pos = puzzle.position[i]
        const [row, col] = getRowCol(pos, puzzle.COL)

        // const tile = puzzle.position[r]
        const button = <ComponentButton>components[row].components[col]
        button.setLabel((i + 1).toString())
      }

      // Set empty styles
      const [row, col] = getRowCol(puzzle.empty, puzzle.COL)
      const prev = <ComponentButton>components[row].components[col]
      // components[row].components[col] = emptyButton //.setCustomId(row + "_" + col)
      components[row].components[col] = new ComponentButton({
        label: EMPTY_CHAR,
        // customId: "empty",
        disabled: true,
        style: MessageComponentButtonStyles.SECONDARY,
      })

      if (typeof lastEmpty != "undefined") {
        const [row, col] = getRowCol(lastEmpty, puzzle.COL)
        components[row].components[col] = prev
          .setCustomId(row + "_" + col)
          .setLabel((puzzle.position.indexOf(lastEmpty) + 1).toString())
      }
    }

    const interactionComponentListener = (interaction: Structures.Interaction) => {
      if (interaction.message!.id != message.id) return

      const data = interaction.data as Structures.InteractionDataComponent
      const index = customIdToIndex(data.customId)

      if (context.user == interaction.user || interaction.client.isOwner(interaction.userId)) {
        const lastEmpty = puzzle.empty
        const done = puzzle.slideTile(index)
        if (done) {
          if (puzzle.status == "complete") {
            context.cluster!.off("messageComponentInteraction", interactionComponentListener)
          } else {
          }
          updateComponents(lastEmpty)
          context
            .editResponse({
              components,
              embed,
            })
            .catch((error) => {
              console.error(error)
            })
        } else {
        }

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
}

function customIdToIndex(id: string) {
  const [r, c] = id.split("_")
  const index = +r * FOUR + +c
  return isNaN(index) ? -1 : index
}

/* 
    puzzle
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
        puzzle.removeAllListeners()
        context.cluster!.off("messageComponentInteraction", interactionComponentListener)
      })

*/
