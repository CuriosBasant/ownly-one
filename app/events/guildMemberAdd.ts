import { ClusterClient, GatewayClientEvents, Structures } from "detritus-client"
import sendWelcomeMessage from "../functions/sendWelcomeMessage"
import updateChannelCounter from "../functions/updateChannelCounter"

export default async function (
  this: ClusterClient,
  { guildId, member }: GatewayClientEvents.GuildMemberAdd
) {
  const guild = member.guild ?? ((await this.rest.fetchGuild(guildId)) as Structures.Guild)
  sendWelcomeMessage(guild, member)
  updateChannelCounter(guild, "allMembers", guild.memberCount)
}
