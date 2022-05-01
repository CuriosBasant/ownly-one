import { Constants, Interaction } from "detritus-client"
import {
  ApplicationCommandOptionTypes,
  ChannelTypes,
  Permissions,
} from "detritus-client/lib/constants"
import { BaseCommand } from "../command-types/BaseCommand"
import { firestore } from "../firebase"

const CounterTypes = Object.entries({
  all_members: "All Members",
  members: "Members",
  bots: "Bots",

  roles: "Roles",
  emojies: "Emojies",

  channels: "Channels",
  categories: "Categories",
  text: "Text",
  voice: "Voice",
}).map(([value, name]) => ({ value, name }))

export default class CountersCommand extends BaseCommand {
  name = "counters"
  description = "Set Counters"

  permissions = [Permissions.MANAGE_CHANNELS]
  permissionsClient = [Permissions.MANAGE_CHANNELS]

  constructor() {
    super({
      options: [
        {
          name: "setup",
          description: "Setup up the counters",
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          async run(context) {
            const guild =
              context.guild ??
              (await context.rest.fetchGuild(context.guildId!, { withCounts: true }))

            const categoryChannel = await guild.createChannel({
              name: "Counters",
              // positon: 0,
              permissionOverwrites: [
                {
                  id: guild.id,
                  deny: Number(Permissions.CONNECT | Permissions.SEND_MESSAGES),
                  allow: 0,
                  type: 0,
                },
              ],
              type: ChannelTypes.GUILD_CATEGORY,
            })

            const allMemberChannel = await guild.createChannel({
              name: `All Member: ${guild.memberCount}`,
              parentId: categoryChannel.id,

              type: ChannelTypes.GUILD_VOICE,
            })

            firestore.doc(`guilds/${guild.id}`).set(
              {
                counters: { allMembers: allMemberChannel.id },
              },
              { merge: true }
            )
          },
        },
        {
          name: "add",
          description: "Adds a new specified counter",
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          options: [
            {
              name: "counter-type",
              description: "Specifiy the counter to add.",
              required: true,
              choices: CounterTypes,
              type: ApplicationCommandOptionTypes.STRING,
              run(context) {
                console.log("adding now")
              },
            },
          ],
        },
        {
          name: "remove",
          description: "Removes the specified counter",
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          options: [
            {
              name: "counter-type",
              description: "Specifiy the counter to remove.",
              required: true,
              choices: CounterTypes,
              type: ApplicationCommandOptionTypes.STRING,
              run(context) {
                console.log("adding now")
              },
            },
          ],
        },
      ],
    })
  }

  async run(context: Interaction.InteractionContext, a) {
    console.log("in counters", a)
  }
}
