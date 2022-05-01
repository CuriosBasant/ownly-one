import { Structures } from "detritus-client"
import { FieldValue, firestore } from "../firebase"

const stalkMessages = {
  voiceJoin(member: Structures.Member) {
    return `The user ${member.user.mention} you're stalking has just joined the voice channel ${member.voiceChannel?.mention}, in the guild named ${member.guild?.name}`
  },
  voiceLeave(member: Structures.Member) {
    return `The user ${member.user.mention} you're stalking has now left the voice channel ${member.voiceChannel?.mention}, in the guild named ${member.guild?.name}`
  },
}

export async function startStalking(stalker: Structures.User, stalkee: Structures.User) {
  const stalksRef = firestore.collection("stalks")
  const alreadyStalkingSnapshot = await stalksRef
    .where("stalker", "==", stalker.id)
    .where("stalkee", "==", stalkee.id)
    .orderBy("timestamp", "desc")
    .get()

  if (!alreadyStalkingSnapshot.empty) {
    return false
  }
  stalksRef.add({
    stalker: stalker.id,
    stalkee: stalkee.id,
    timestamp: FieldValue.serverTimestamp(),
  })
  return true
}

export async function stopStalking(stalker: Structures.User, stalkee: Structures.User) {
  const stalks = await firestore
    .collection("stalks")
    .where("stalker", "==", stalker.id)
    .where("stalkee", "==", stalkee.id)
    .get()

  for (const stalk of stalks.docs) {
    stalk.ref.delete()
  }
}

export async function stalkUser(member: Structures.Member, type: keyof typeof stalkMessages) {
  const stalksRef = firestore.collection("stalks")
  const stalkersSnapshot = await stalksRef
    .where("stalkee", "==", member.id)
    .orderBy("timestamp", "desc")
    .get()

  if (stalkersSnapshot.empty) {
    console.log("no one to stalk")
    return
  }

  for (const stalkerRef of stalkersSnapshot.docs) {
    const stalkerId = stalkerRef.get("stalker")
    const stalkerUser = member.client.users.get(stalkerId)
    if (!stalkerUser) continue
    const dmChannel = await stalkerUser.createOrGetDm()
    dmChannel.createMessage(stalkMessages[type](member))
  }
}
