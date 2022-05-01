import { Structures } from "detritus-client"
import { BaseCollection } from "detritus-client/lib/collections"

const listeners = new BaseCollection<string, () => void>()

export function addComponentListener(message: Structures.Message, callback: () => void) {}
