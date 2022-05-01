import { Constants, Structures } from "detritus-client"
import { BaseCollection, BaseSet } from "detritus-client/lib/collections"
import { firestore } from "../firebase"

const vcGeneratorsCache = new BaseSet<Structures.ChannelGuildVoice>()
const generatedVCSCache = new BaseCollection<string, string>()

export async function handleVCGeneration(channel: Structures.ChannelGuildVoice, userId: string) {
  if (!(await isMasterChannel(channel))) return

  const member =
    channel.client.members.get(channel.guildId, userId) ??
    (await channel.client.rest.fetchGuildMember(channel.guildId, userId))
  const newChannel = await createTemporaryVCFrom(channel, member)
  member.move(newChannel.id)
}

export async function handleVCDeletion(channel: Structures.ChannelGuildVoice, userId: string) {
  const channelOwnerId = await getChannelOwnerId(channel)
  if (!channelOwnerId) return

  if ((channel.memberCount ?? 0) < 1) {
    generatedVCSCache.delete(channel.id)
    channel.delete()
    firestore.doc(`guilds/${channel.guildId}/generated-vcs/${channel.id}`).delete()
  } else {
    // if channelowner leaves
    if (userId == channelOwnerId) {
      const channelFirstMember = channel.members.first()!
      updateTempVCOwner(channel, channelFirstMember.id)
      channel.edit({
        name: `${channelFirstMember.nick}'s Channel`,
      })
    }
  }
}

async function isMasterChannel(channel: Structures.ChannelGuildVoice) {
  if (generatedVCSCache.has(channel.id)) return false
  if (vcGeneratorsCache.has(channel)) return true

  const snapshot = await firestore
    .doc(`guilds/${channel.guildId}/vc-generators/${channel.id}`)
    .get()

  if (snapshot.exists) {
    vcGeneratorsCache.add(channel)
    return true
  }
  return false
}
async function getChannelOwnerId(channel: Structures.ChannelGuildVoice) {
  const memberId = generatedVCSCache.get(channel.id)
  if (memberId) return memberId

  const snapshot = await firestore
    .doc(`guilds/${channel.guildId}/generated-vcs/${channel.id}`)
    .get()

  if (snapshot.exists) {
    generatedVCSCache.set(channel.id, snapshot.get("ownedBy"))
    return snapshot.get("ownedBy")
  }
  return null
}

function updateTempVCOwner(channel: Structures.ChannelGuildVoice, ownedBy: string) {
  firestore.doc(`guilds/${channel.guildId}/generated-vcs/${channel.id}`).update({
    ownedBy,
  })
  generatedVCSCache.set(channel.id, ownedBy)
}

export async function createMasterChannel(guild: Structures.Guild, categoryId: string) {
  const masterChannel = (await guild.createChannel({
    name: `Create Channel`,
    parentId: categoryId,

    type: Constants.ChannelTypes.GUILD_VOICE,
  })) as Structures.ChannelGuildVoice

  firestore.doc(`guilds/${guild.id}/vc-generators/${masterChannel.id}`).create({
    masterChannelId: masterChannel.id,
  })

  return masterChannel
}

async function createTemporaryVCFrom(
  channel: Structures.ChannelGuildVoice,
  member: Structures.Member
) {
  const tempVC = await channel.guild!.createChannel({
    name: `${member.nick}'s Channel`,
    bitrate: channel.bitrate,
    parentId: channel.parentId!,
    type: Constants.ChannelTypes.GUILD_VOICE,
  })
  firestore.doc(`guilds/${channel.guildId}/generated-vcs/${tempVC.id}`).create({
    masterChannelId: channel.id,
    ownedBy: member.id,
  })
  return tempVC
}
