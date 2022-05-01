import { Interaction } from "detritus-client"
import { InteractionCallbackTypes } from "detritus-client/lib/constants"
import { Components } from "detritus-client/lib/utils"
import { BaseCommand } from "../command-types/BaseCommand"

export default class CheckCommand extends BaseCommand {
  name = "check"
  description = "Check for something"

  async run(context: Interaction.InteractionContext) {
    const components = new Components()
    components.createSelectMenu({
      customId: "test",
      options: [
        {
          label: "Label 1",
          value: "label_1",
          description: "Kuch nhi aise hi",
        },
      ],
      run(ctx) {
        console.log("something has been selected")
      },
    })

    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: "Testing select menus",
      components,
    })
  }
}
