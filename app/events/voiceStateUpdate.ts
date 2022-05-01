import { ClusterClient, GatewayClientEvents, Structures } from "detritus-client"
import { handleVCDeletion, handleVCGeneration } from "../functions/handleVoiceChannelGeneration"

export default async function (
  this: ClusterClient,
  { joinedChannel, leftChannel, old, voiceState }: GatewayClientEvents.VoiceStateUpdate
) {
  if (joinedChannel || voiceState.channel) {
    handleVCGeneration(voiceState.channel!, voiceState.userId)
  }

  const leavedChannel = old?.channel!

  if (leftChannel || leavedChannel) {
    handleVCDeletion(leavedChannel, old!.userId)
  }

  joinedChannel
    ? this.emit("voiceChannelEnter", voiceState)
    : leftChannel
    ? this.emit("voiceChannelLeave", old!)
    : this.emit("voiceChannelChange", old!, voiceState)
  // joinedChannel
  //   ? onJoin(this, voiceState)
  //   : leftChannel
  //   ? onLeave(this, old!)
  //   : onChange(this, old!, voiceState)
}

function onJoin(bot: ClusterClient, state: Structures.VoiceState) {
  console.log(state.channel?.memberCount)
  // bot.metadata.collectors.get(state.channelId!)?.(state.member)
}

function onChange(bot: ClusterClient, old: Structures.VoiceState, current: Structures.VoiceState) {
  bot.metadata.collectors.get(current.channelId!)?.(current.member)
}

function onLeave(bot: ClusterClient, state: Structures.VoiceState) {
  bot.emit("voiceChannelLeave", { channel: state.channel, member: state.member })
  if (bot.metadata.tempChannels.has(state.channelId!)) {
    console.log(state.channel?.memberCount)
    if ((state.channel?.memberCount ?? 0) < 1) {
      bot.metadata.tempChannels.delete(state.channelId!)
      state.channel?.delete()
    } else {
      const channelOwner = bot.metadata.tempChannels.get(state.channelId!)!
      // if channelowner leaves
      if (state.member == channelOwner) {
        const channelFirstMember = state.channel?.members.first()!
        bot.metadata.tempChannels.set(state.channelId!, channelFirstMember)
        state.channel?.edit({
          name: `${channelFirstMember.nick}'s Channel`,
        })
      }
    }
  }
}
