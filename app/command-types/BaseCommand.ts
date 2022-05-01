import { Interaction, Structures, Utils } from "detritus-client"
import { BaseSet } from "detritus-client/lib/collections"
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  InteractionCallbackTypes,
  MessageFlags,
} from "detritus-client/lib/constants"
import { Embed, Markup } from "detritus-client/lib/utils"
import { TEST_SERVER_ID } from "../config"
import { ReadablePermissions } from "./../utils"

export abstract class BaseCommand<
  ParsedArgsFinished = Interaction.ParsedArgs
> extends Interaction.InteractionCommand<ParsedArgsFinished> {
  global = false
  guildIds = new BaseSet([TEST_SERVER_ID])
  error = "Command"

  onRunError(context: Interaction.InteractionContext, args: ParsedArgsFinished, error: any) {
    const embed = new Utils.Embed()
    embed.setTitle(`⚠ ${this.error} Error`)
    embed.setDescription(Utils.Markup.codestring(String(error)))

    return context.editOrRespond({
      embed,
      flags: MessageFlags.EPHEMERAL,
    })
  }

  onValueError(
    context: Interaction.InteractionContext,
    args: Interaction.ParsedArgs,
    errors: Interaction.ParsedErrors
  ) {
    const embed = new Utils.Embed()
    embed.setTitle(`⚠ ${this.error} Argument Error`)

    const store: Record<string, string> = {}

    const description = ["Invalid Arguments" + "\n"]
    for (let key in errors) {
      const message = errors[key].message
      if (message in store) {
        description.push(`**${key}**: Same error as **${store[message]}**`)
      } else {
        description.push(`**${key}**: ${message}`)
      }
      store[message] = key
    }

    embed.setDescription(description.join("\n"))
    return context.editOrRespond({
      embed,
      flags: MessageFlags.EPHEMERAL,
    })
  }
  onPermissionsFail(
    context: Interaction.InteractionContext,
    permissions: Interaction.FailedPermissions
  ) {
    context.editOrRespond(
      `You need these permissions ${permissions.map(
        (val) => ReadablePermissions[val.toString()]
      )} to run that command`
    )
  }
  onPermissionsFailClient(
    context: Interaction.InteractionContext,
    permissions: Interaction.FailedPermissions
  ) {
    const permissionStrings = permissions.map((val) => ReadablePermissions[val.toString()])
    const embed = new Embed()
      .setTitle("I need the following permissions to run this command!")
      .setDescription(Markup.codeblock(permissionStrings.join("  \n")))
    context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, { embed })
  }
}

export abstract class BaseUserCommand extends BaseCommand<{
  member: Structures.Member
  user: Structures.User
}> {
  type = ApplicationCommandTypes.USER
}

export abstract class BaseMessageCommand extends BaseCommand<{ message: Structures.Message }> {
  type = ApplicationCommandTypes.MESSAGE
}

export abstract class BaseCommandOption<
  ParsedArgsFinished = Interaction.ParsedArgs
> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
  type = ApplicationCommandOptionTypes.SUB_COMMAND
}
