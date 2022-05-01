import { Constants, Utils } from "detritus-client"
import { Permissions } from "detritus-client/lib/constants"
import path from "path"

export const EMPTY_CHAR = "\u200B"

export async function getAndParseEventsIn(directory: string, subdirectories = false) {
  if (require.main) {
    // require.main.path exists but typescript doesn't let us use it..
    directory = path.join(path.dirname(require.main.filename), directory)
  }
  const errors = {},
    events = {}
  const files = await Utils.getFiles(directory, subdirectories)
  for (const file of files) {
    if (!Constants.FILE_EXTENSIONS_IMPORT.some((ext) => file.endsWith(ext))) {
      continue
    }
    const filepath = path.resolve(directory, file)
    try {
      let importedEvent = Constants.IS_IMPORT_AVAILABLE
        ? (await Promise.resolve().then(() => require(filepath))).default
        : require(filepath)
      if (typeof importedEvent === "object" && importedEvent.__esModule) {
        importedEvent = importedEvent.default
      }

      events[file.slice(0, file.indexOf("."))] = importedEvent
    } catch (error) {
      errors[filepath] = error
    }
  }
  if (Object.keys(errors).length) {
    console.error("Some files couldn't be loaded", errors)
  }
  return events
}

export function randomNumber(min: number, max?: number) {
  if (!max) {
    max = min
    min = 0
  }

  return ((Math.random() * (max - min)) | 0) + min
}

export function create2DArray(row: number, col: number): null[][]
export function create2DArray<T>(row: number, col: number, fill: T): T[][]
export function create2DArray(row: number, col: number, fill = null) {
  return Array.from(Array(row), () => Array(col).fill(fill))
}

export const yesNo = (bool: boolean) => (bool ? "Yes" : "No")
export function numberToOrdinal(num: number) {
  const once = num % 10

  return num + (once == 1 ? "st" : once == 2 ? "nd" : once == 3 ? "rd" : "th")
}

export const ReadablePermissions = Object.freeze({
  // [String(Permissions.NONE)]: "None",
  [String(Permissions.ADD_REACTIONS)]: "Add Reactions",
  [String(Permissions.ADMINISTRATOR)]: "Administrator",
  [String(Permissions.ATTACH_FILES)]: "Attach Files",
  [String(Permissions.BAN_MEMBERS)]: "Ban Members",
  [String(Permissions.CHANGE_NICKNAME)]: "Change Nickname",
  [String(Permissions.CHANGE_NICKNAMES)]: "Change Nicknames",
  [String(Permissions.CONNECT)]: "Connect",
  [String(Permissions.CREATE_INSTANT_INVITE)]: "Create Instant Invite",
  [String(Permissions.DEAFEN_MEMBERS)]: "Deafen Members",
  [String(Permissions.EMBED_LINKS)]: "Embed Links",
  [String(Permissions.KICK_MEMBERS)]: "Kick Members",
  [String(Permissions.MANAGE_CHANNELS)]: "Manage Channels",
  [String(Permissions.MANAGE_EMOJIS)]: "Manage Emojis",
  [String(Permissions.MANAGE_GUILD)]: "Manage Guild",
  [String(Permissions.MANAGE_MESSAGES)]: "Manage Messages",
  [String(Permissions.MANAGE_ROLES)]: "Manage Roles",
  [String(Permissions.MANAGE_THREADS)]: "Manage Threads",
  [String(Permissions.MANAGE_WEBHOOKS)]: "Manage Webhooks",
  [String(Permissions.MENTION_EVERYONE)]: "Mention Everyone",
  [String(Permissions.MOVE_MEMBERS)]: "Move Members",
  [String(Permissions.MUTE_MEMBERS)]: "Mute Members",
  [String(Permissions.PRIORITY_SPEAKER)]: "Priority Speaker",
  [String(Permissions.READ_MESSAGE_HISTORY)]: "Read Message History",
  [String(Permissions.REQUEST_TO_SPEAK)]: "Request To Speak",
  [String(Permissions.SEND_MESSAGES)]: "Send Messages",
  [String(Permissions.SEND_TTS_MESSAGES)]: "Text-To-Speech",
  [String(Permissions.SPEAK)]: "Speak",
  [String(Permissions.STREAM)]: "Go Live",
  [String(Permissions.USE_APPLICATION_COMMANDS)]: "Use Application Commands",
  [String(Permissions.USE_EXTERNAL_EMOJIS)]: "Use External Emojis",
  [String(Permissions.USE_PRIVATE_THREADS)]: "Use Private Threads",
  [String(Permissions.USE_PUBLIC_THREADS)]: "Use Public Threads",
  [String(Permissions.USE_VAD)]: "Voice Auto Detect",
  [String(Permissions.VIEW_AUDIT_LOG)]: "View Audit Logs",
  [String(Permissions.VIEW_CHANNEL)]: "View Channel",
  [String(Permissions.VIEW_GUILD_ANALYTICS)]: "View Guild Analytics",
})

export function permissionToArrayString(bitField: bigint | number) {
  return Object.keys(ReadablePermissions)
    .filter((field) => {
      const num = +field
      return num === (Number(bitField) & num)
    })
    .map((ke) => ReadablePermissions[ke])
}

export function getRowCol(index: number, size: number): [number, number] {
  return [(index / size) | 0, index % size]
}
