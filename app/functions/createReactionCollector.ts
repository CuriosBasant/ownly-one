import { GatewayClientEvents, ShardClient, Structures } from "detritus-client"
import { BaseCollection } from "detritus-client/lib/collections"
import { ClientEvents } from "detritus-client/lib/constants"
import Collector, { CollectorOptions } from "../classes/EventCollector"

interface ReactionCollectorOptions extends CollectorOptions {
  /** The maximum total amount of reactions to collect */
  max?: number
  /** The maximum number of emojis to collect */
  maxEmojis?: number
  /** The maximum number of users to react */
  maxUsers?: number
}

function createReactionCollector(message: Structures.Message, options: ReactionCollectorOptions) {
  const collector = new ReactionCollector(message, options)
}

class ReactionCollector extends Collector<GatewayClientEvents.MessageReactionAdd> {
  total = 0
  users = new BaseCollection<string, Structures.User>()

  static key(reaction: Structures.Reaction) {
    return reaction.emoji.id ?? reaction.emoji.name
  }

  constructor(readonly message: Structures.Message, readonly options: ReactionCollectorOptions) {
    super(message.client, options)

    const messageDeleteListener = ({ messageId }: GatewayClientEvents.MessageDelete) => {
        if (messageId === this.message.id) this.stop("messageDelete")
      },
      bulkDeleteListener = ({ messages }: GatewayClientEvents.MessageDeleteBulk) => {
        if (messages.has(this.message.id)) this.stop("messageDelete")
      },
      channelDeleteListener = ({ channel }: GatewayClientEvents.ChannelDelete) => {
        if (
          channel.id === this.message.channelId ||
          channel.guild?.threads?.cache.has(this.message.channelId)
        )
          this.stop("channelDelete")
      },
      threadDeleteListener = ({ thread }: GatewayClientEvents.ThreadDelete) => {
        if (thread?.id === this.message.channelId) this.stop("threadDelete")
      },
      guildDeleteListener = ({ guildId }: GatewayClientEvents.GuildDelete) => {
        if (guildId === this.message.guildId) this.stop("guildDelete")
      }

    // this.client.incrementMaxListeners();
    this.client.on(ClientEvents.MESSAGE_REACTION_ADD, this.handleCollect)
    this.client.on(ClientEvents.MESSAGE_REACTION_REMOVE, this.handleDispose)
    this.client.on(ClientEvents.MESSAGE_REACTION_REMOVE_ALL, this.empty)
    this.client.on(ClientEvents.MESSAGE_DELETE, messageDeleteListener)
    this.client.on(ClientEvents.MESSAGE_DELETE_BULK, bulkDeleteListener)
    this.client.on(ClientEvents.CHANNEL_DELETE, channelDeleteListener)
    this.client.on(ClientEvents.THREAD_DELETE, threadDeleteListener)
    this.client.on(ClientEvents.GUILD_DELETE, guildDeleteListener)

    this.once("end", () => {
      this.client.off(ClientEvents.MESSAGE_REACTION_ADD, this.handleCollect)
      this.client.off(ClientEvents.MESSAGE_REACTION_REMOVE, this.handleDispose)
      this.client.off(ClientEvents.MESSAGE_REACTION_REMOVE_ALL, this.empty)
      this.client.off(ClientEvents.MESSAGE_DELETE, messageDeleteListener)
      this.client.off(ClientEvents.MESSAGE_DELETE_BULK, bulkDeleteListener)
      this.client.off(ClientEvents.CHANNEL_DELETE, channelDeleteListener)
      this.client.off(ClientEvents.THREAD_DELETE, threadDeleteListener)
      this.client.off(ClientEvents.GUILD_DELETE, guildDeleteListener)
      // this.client.decrementMaxListeners();
    })

    this.on("collect", (payload) => {
      if (payload.reaction.count === 1) {
        this.emit("create", payload)
      }
      this.total++
      this.users.set(payload.userId, payload.user!)
    })

    this.on("remove", async ({ userId }) => {
      this.total--
      for (const [_, { reaction }] of this.collected) {
        if ((await reaction.fetchUsers()).has(userId)) {
          break
        } else {
          this.users.delete(userId)
        }
      }
    })
  }
  collect({ reaction, messageId }: GatewayClientEvents.MessageReactionAdd) {
    if (messageId !== this.message.id) return null

    return ReactionCollector.key(reaction)
  }

  dispose({ reaction, messageId, user, userId }: GatewayClientEvents.MessageReactionRemove) {
    if (messageId !== this.message.id) return null

    if (this.collected.has(ReactionCollector.key(reaction)) && this.users.has(userId)) {
      this.emit("remove", reaction, user)
    }
    return reaction.count ? null : ReactionCollector.key(reaction)
  }

  empty() {
    this.total = 0
    this.collected.clear()
    this.users.clear()
    this.checkEnd()
  }

  get endReason() {
    if (this.options.max && this.total >= this.options.max) return "limit"
    if (this.options.maxEmojis && this.collected.size >= this.options.maxEmojis) return "emojiLimit"
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return "userLimit"
    return null
  }

  // private handleMessageDeletion(message) {
  //   if (message.id === this.message.id) {
  //     this.stop("messageDelete")
  //   }
  // }

  // private handleChannelDeletion(channel) {
  //   if (
  //     channel.id === this.message.channelId ||
  //     channel.threads?.cache.has(this.message.channelId)
  //   ) {
  //     this.stop("channelDelete")
  //   }
  // }

  // private handleThreadDeletion(thread) {
  //   if (thread.id === this.message.channelId) {
  //     this.stop("threadDelete")
  //   }
  // }

  // private handleGuildDeletion(guild) {
  //   if (guild.id === this.message.guild?.id) {
  //     this.stop("guildDelete")
  //   }
  // }
}
