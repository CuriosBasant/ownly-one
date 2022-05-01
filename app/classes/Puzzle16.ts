export default class Puzzle16 {
  moves = 0
  position: number[]
  status!: "start" | "complete"

  constructor(readonly ROW = 4, readonly COL = ROW) {
    this.position = Array.from(Array(ROW * COL), (_, i) => i)
    this.restart()
  }
  slideTile(pos: number) {
    if (pos == this.empty || this.status == "complete") return false

    const locRC = this.toRC(pos),
      empRC = this.toRC(this.empty)

    let offset = 1
    if (locRC.r == empRC.r) {
    } else if (locRC.c == empRC.c) {
      offset = this.COL
    } else return false

    const direction = offset * (pos < this.empty ? 1 : -1)
    for (let e = this.empty; e != pos; ) {
      e -= direction
      const t = this.position.indexOf(e)
      this.position[t] = this.empty
      this.empty = e
    }
    this.moves++
    if (this.checkCompleted()) {
      this.status = "complete"
    }
    return true
  }
  _slideTile(index: number) {
    const loc = this.position[index]
    if (loc == this.empty) return

    const locRC = this.toRC(loc),
      empRC = this.toRC(this.empty)

    let offset = 1
    if (locRC.r == empRC.r) {
    } else if (locRC.c == empRC.c) {
      offset = this.COL
    } else return

    const direction = offset * (loc < this.empty ? 1 : -1)
    for (let t = index; this.position[t] != this.empty; ) {
      const tgt = this.position[t] + direction,
        pt = t
      t = this.position.indexOf(tgt)
      this.position[pt] = tgt
    }
    this.empty = loc
  }
  restart() {
    this.status = "start"
  }
  checkCompleted() {
    return this.position.every((p, i) => p == i)
  }
  getRandomTile(vertical = false): number {
    const r = (Math.random() * (vertical ? this.ROW : this.COL)) | 0
    const ec = this.toRC(this.empty)
    if (r == ec[vertical ? "r" : "c"]) return this.getRandomTile(vertical)

    if (vertical) {
      return r * this.COL + ec.c
    } else {
      return ec.r * this.COL + r
    }
  }
  shuffle(times = 32) {
    for (let i = 0; i < times; i++) {
      const r = this.getRandomTile(i % 2 == 0)
      this.slideTile(r)
    }
    return this
  }
  get empty() {
    return this.position.at(-1)!
  }
  set empty(value) {
    this.position[this.position.length - 1] = value
  }
  toRC(num: number) {
    return { r: (num / this.COL) | 0, c: num % this.COL } as const
  }
  kk() {
    return this.position.reduce<number[]>((arr, n, i) => ((arr[n] = i), arr), [])
  }
}
