import { Structures, Utils } from "detritus-client"
import { Embed, Markup } from "detritus-client/lib/utils"
import { permissionToArrayString } from "../utils"

export default async function notifyOwnerOfGuildCount(guild: Structures.Guild, kicked = false) {
  const embed = new Embed()
    .setAuthor(guild.owner?.name, guild.owner?.avatarUrl)
    .setTitle(guild.name)
    // .setColor()
    .setThumbnail(guild.iconUrl!)
    .setDescription(Markup.codeblock(guild.description ?? "No description set"))
    .addField("Server Id", Markup.codeblock(guild.id), true)
    .addField("Member Count", Markup.codeblock(guild.memberCount.toString()), true)
    .addField("Server Region", Markup.codeblock(guild.region), true)
    .addField("Server Owner Id", Markup.codeblock(guild.ownerId), true)
    .addField("Server Owner Name", Markup.codeblock(guild.owner?.tag ?? ""), true)
    .addField(
      "Permissions Given",
      Markup.codeblock(
        guild.me ? permissionToArrayString(guild.me.permissions).join("\n  ") : "Can't figure out"
      )
    )
    .setFooter(guild.me!.username + " • ", guild.me?.avatarUrl)
    .setTimestamp()

  for (const [_, owner] of guild.client.owners) {
    const dmChannel = await owner.createOrGetDm()
    dmChannel.createMessage({
      content: "I've just joined a new guild.",
      embed,
    })
  }
}
