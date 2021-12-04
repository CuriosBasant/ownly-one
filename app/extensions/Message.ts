import { Message } from "discord.js"

declare module "discord.js" {
  interface Message {
    sendMessage: (content: string) => Promise<Message>
  }
}

Message.prototype.sendMessage = async function (text) {
  return this.channel.send(text + " Working")
}
