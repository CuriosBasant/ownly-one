import { Interaction, Structures } from "detritus-client"
import {
  InteractionCallbackTypes,
  MessageComponentButtonStyles,
} from "detritus-client/lib/constants"
import { ComponentActionRow, ComponentContext } from "detritus-client/lib/utils"

export async function sendConfirmationDialog(
  context: Interaction.InteractionContext,
  samne: Structures.Member,
  message: string
) {
  return new Promise<boolean>((resolve, reject) => {
    const t = setTimeout(reject, 20_000)
    let responsed = false
    const fun = (bl: boolean, cc: ComponentContext) => {
      if (responsed) return
      if (cc.member == samne || cc.client.isOwner(cc.userId)) {
        resolve(bl)
        cc.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
        clearTimeout(t)
        responsed = true
      } else {
        cc.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
          // flags: MessageFlags.EPHEMERAL,
          content: "You were not challenged!",
        })
      }
    }
    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: message,
      components: [
        new ComponentActionRow()
          .addButton({
            label: "Accept",
            customId: "accept",
            style: MessageComponentButtonStyles.SUCCESS,
            run: fun.bind(null, true),
          })
          .addButton({
            label: "Decline",
            customId: "decline",
            style: MessageComponentButtonStyles.DANGER,
            run: fun.bind(null, false),
          }),
      ],
    })
  })
}
