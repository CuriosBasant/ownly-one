const { Encoder } = require("@evan/opus")
const { spawn } = require("child_process")
const { ShardClient } = require("detritus-client")

const c = new ShardClient("NDQyNDIyNTM3MDYyNzExMjk2.Wu4UGA.H3-5yztYEsp-_0q_HbwqCJ1Bykk", {
  gateway: { intents: (1 << 0) | (1 << 7) | (1 << 9) },
})

c.on("gatewayReady", () => console.log("ready"))

c.on("messageCreate", async ({ message }) => {
  if ("ttmusic" === message.content) {
    const state = { stop: false, paused: false }
    const { connection } = await message.member.voiceChannel.join({
      wait: true,
      opusEncoder: false,
    })

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

    play(state, stream.stdout, connection)
  }
})

c.run()

const u16_max = 2 ** 16
const sleep = (time) => new Promise((r) => setTimeout(r, time))

async function play(state, stream, connection) {
  const encoder = new Encoder({ channels: 2, sample_rate: 48_000, application: "audio" })

  encoder.complexity = 10
  encoder.signal = "music"
  encoder.bitrate = connection.channel.bitrate ?? 96_000
  const packets = encoder.encode_pcm_stream(960, stream)

  let seq = 0
  const start = Date.now()

  while (true) {
    if (state.stop) break

    if (state.paused) {
      connection.sendAudioSilenceFrame()
      if (state.speaking) state.speaking = (connection.setSpeaking({ voice: false }), false)
    } else {
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
