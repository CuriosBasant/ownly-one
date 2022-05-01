import { ClusterClient, GatewayClientEvents, Structures } from "detritus-client"
import notifyOwnerOfGuildCount from "../functions/notifyOwnerOfGuildCount"
import sendWelcomeMessage from "../functions/sendWelcomeMessage"
import updateChannelCounter from "../functions/updateChannelCounter"

export default async function (
  this: ClusterClient,
  { guildId, guild, isUnavailable }: GatewayClientEvents.GuildDelete
) {
  if (isUnavailable) return
  guild = guild ?? <Structures.Guild>await this.rest.fetchGuild(guildId, { withCounts: true })
  notifyOwnerOfGuildCount(guild, true)
}
