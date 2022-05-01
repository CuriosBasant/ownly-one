import { Structures, Utils } from "detritus-client"
import { firestore } from "../firebase"

export default async function updateChannelCounter(
  guild: Structures.Guild,
  counterType: string,
  newCount: number
) {
  const snapshot = await firestore.doc(`guilds/${guild.id}`).get()
  if (!snapshot.exists) return
  const channelId = snapshot.get(`counters.${counterType}`)
  const counterChannel = guild.client.channels.get(channelId)

  if (!counterChannel) return console.log("No counter channel found")

  counterChannel
    .edit({
      name: counterChannel.name.replace(/[0-9]+/, newCount.toString()),
    })
    .catch(console.error)
}
