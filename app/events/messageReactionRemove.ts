import { ClusterClient, GatewayClientEvents } from "detritus-client"

export default function (this: ClusterClient, {}: GatewayClientEvents.MessageReactionRemove) {}
