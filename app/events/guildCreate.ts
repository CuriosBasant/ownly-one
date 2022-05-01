import { ClusterClient, GatewayClientEvents, Structures } from "detritus-client"
import notifyOwnerOfGuildCount from "../functions/notifyOwnerOfGuildCount"
import sendWelcomeMessage from "../functions/sendWelcomeMessage"
import updateChannelCounter from "../functions/updateChannelCounter"

export default async function (
  this: ClusterClient,
  { guild, fromUnavailable }: GatewayClientEvents.GuildCreate
) {
  if (fromUnavailable) return
  // const guild = member.guild ?? ((await this.rest.fetchGuild(guildId)) as Structures.Guild)
  notifyOwnerOfGuildCount(guild)
}
