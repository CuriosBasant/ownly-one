import format from "date-fns/format"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { Structures, Utils } from "detritus-client"
import { numberToOrdinal, yesNo } from "../utils"

export default function sendWelcomeMessage(guild: Structures.Guild, member: Structures.Member) {
  const welcomeChannel = guild.systemChannel

  if (!welcomeChannel?.canMessage) return
  member.user
  welcomeChannel.createMessage({
    content: `Welcome ${member.user.mention}`,
    embed: new Utils.Embed()
      .setAuthor(`Welcome To ${guild.name}`, guild.iconUrl)
      .setTitle(member.tag)
      .setThumbnail(member.avatarUrl)

      .addField("User ID", Utils.Markup.codeblock(member.id), true)
      .addField("Is a Bot?", Utils.Markup.codeblock(yesNo(member.bot)), true)
      .addField("Ordinal", Utils.Markup.codeblock(numberToOrdinal(guild.memberCount)), true)
      // .addField("Verified", Utils.Markup.codeblock(yesNo(member.user.email)), true)
      .addField("Account Age", Utils.Markup.codeblock(formatDistanceToNow(member.createdAt)), true)
      .addField("Account Created", Utils.Markup.codeblock(format(member.createdAt, "PPpp")), true)
      .addField("Last Usernames", Utils.Markup.codeblock(member.user.names.join(", ")))
      .setTimestamp(),
  })
}
