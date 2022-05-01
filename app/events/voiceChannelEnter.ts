import { ClusterClient, Structures } from "detritus-client"
import { stalkUser } from "../functions/stalking"

export default async function (this: ClusterClient, voiceState: Structures.VoiceState) {
  const member = voiceState.member
  console.log(`${member?.name} just joined`)
  member && stalkUser(member, "voiceJoin")
}
