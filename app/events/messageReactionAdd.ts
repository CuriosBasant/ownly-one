import { ClusterClient, GatewayClientEvents } from "detritus-client"
import { addReactionRole } from "../functions/reactionRoles"

export default function (
  this: ClusterClient,
  { reaction, member }: GatewayClientEvents.MessageReactionAdd
) {
  if (reaction.guildId) {
    addReactionRole(reaction)
  } else {
  }
  reaction
}
