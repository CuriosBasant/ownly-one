import { Structures } from "detritus-client"
import { firestore } from "../firebase"

export async function addReactionRole(reaction: Structures.Reaction) {
  const snapshot = await firestore.doc(`guilds/${reaction.guildId!}`).get()
}
