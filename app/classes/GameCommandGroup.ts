import { Constants, Interaction } from "detritus-client"
import { InteractionCallbackTypes } from "detritus-client/lib/constants"
import { BaseCommand } from "../command-types/BaseCommand"

const { Permissions } = Constants

export default abstract class GameCommandGroup extends BaseCommand {
  permissionsClient = [Permissions.SEND_MESSAGES]
  disableDm = true
}
