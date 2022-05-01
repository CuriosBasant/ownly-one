import { ClusterClient, GatewayClientEvents } from "detritus-client"

export default function (this: ClusterClient, { message }: GatewayClientEvents.MessageCreate) {
  if (message.fromBot) return

  switch (message.content) {
    case ";memberjoin":
      this.emit("guildMemberAdd", { guildId: message.guildId, member: message.member })

      break
    case ";guildjoin":
      this.emit("guildCreate", { guildId: message.guildId, guild: message.guild })

      break

    default:
      break
  }
}
