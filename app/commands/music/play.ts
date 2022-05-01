import { Encoder } from "@evan/opus"
import { spawn } from "child_process"
import { Interaction } from "detritus-client"
import { Stream } from "node:stream"
import ytdl from "ytdl-core"
import MusicCommandGroup from "../../classes/MusicCommandGroup"

export interface CommandArgs {
  query: string
}
const u16_max = 2 ** 16
const sleep = (time) => new Promise((r) => setTimeout(r, time))
export default class PlayCommand extends MusicCommandGroup {
  name = "play"
  description = "Plays the specified song from the query"

  constructor() {
    super({
      options: [
        new Interaction.InteractionCommandOption()
          .setName("query")
          .setDescription("Song name, link")
          .setRequired(true),
      ],
    })
  }

  onBeforeRun(context: Interaction.InteractionContext, { query }: CommandArgs) {
    return !!context.member?.voiceChannel
  }

  async run(context: Interaction.InteractionContext, { query }: CommandArgs) {
    const payload = await this.joinVoiceChannel(context)
    if (!payload) return null
    const stream = ytdl("http://www.youtube.com/watch?v=Bg8Yb9zGYyA", {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    })
    // stream.on("data", (chunk) => {
    //   console.log("data aaya")
    //   payload.connection.sendAudio(chunk, { isOpus: true, })
    // })

    play(stream, payload.connection)
    // opus(payload.connection)
    context.editOrRespond(`Playing ${query} in ${payload.connection.channel!.name}`)
  }
}

function opus(connection) {
  const options = [
    "-f",
    "avfoundation",

    "-i",
    ":0",
    "-ac",
    "2",
    "-f",
    "s16le",
    "-ar",
    "48000",
    "-loglevel",
    "0",
    "-analyzeduration",
    "0",

    "pipe:1",
  ]

  const stream = spawn("ffmpeg", options, { shell: false, windowsHide: true })
  const state = { stop: false, paused: false, speaking: false }
  play(stream.stdout, connection, state)
}
async function play(stream, connection, state = { stop: false, paused: false, speaking: false }) {
  const encoder = new Encoder({ channels: 2, sample_rate: 48_000, application: "audio" })

  encoder.complexity = 10
  encoder.signal = "music"
  encoder.bitrate = connection.channel!.bitrate ?? 96_000
  const packets = encoder.encode_pcm_stream(960, stream)

  let seq = 0
  const start = Date.now()

  while (true) {
    if (state.stop) break

    if (state.paused) {
      connection.sendAudioSilenceFrame()
      if (state.speaking) state.speaking = (connection.setSpeaking({ voice: false }), false)
    } else {
      // @ts-ignore
      const { done, value } = await packets.next()
      if (!state.speaking) state.speaking = (connection.setSpeaking({ voice: true }), true)

      if (done) break
      connection.sendAudio(value, { isOpus: true })
    }

    if (seq >= u16_max) seq = 0
    await sleep(20 + 20 * seq++ - (Date.now() - start))
  }

  state.stop = false
  state.paused = false
  state.speaking = (connection.setSpeaking({ voice: false }), false)
}
async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>()

    stream.on("data", (chunk) => _buf.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(_buf)))
    stream.on("error", (err) => reject(`error converting stream - ${err}`))
  })
}
