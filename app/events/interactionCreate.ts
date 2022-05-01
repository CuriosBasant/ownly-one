import { ClusterClient, GatewayClientEvents, Structures } from "detritus-client"
import { MessageComponent, MessageComponentSelectMenu } from "detritus-client/lib/structures"

export default function (
  this: ClusterClient,
  { interaction }: GatewayClientEvents.InteractionCreate
) {
  // console.log("Wow kaam kiya")
  if (interaction.isFromApplicationCommand) {
    this.emit("applicationCommandInteraction")
  } else if (interaction.isFromMessageComponent) {
    this.emit("messageComponentInteraction", interaction)
    interaction.message
  }
}
