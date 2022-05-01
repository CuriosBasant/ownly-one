import { Structures, Utils } from "detritus-client"
import { firestore } from "../firebase"

export default async function updateMemberCounters(
  guild: Structures.Guild,
  member: Structures.Member
) {
  const snapshot = await firestore.doc(`guilds/${guild.id}`).get()
}
