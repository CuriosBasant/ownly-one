import { ShardClient, Structures } from "detritus-client"
import { BaseCollection } from "detritus-client/lib/collections"
import EventEmitter from "events"
import { setTimeout } from "node:timers"

type CollectorFilter<P> = (
  payload: P,
  collection?: BaseCollection<string, P>
) => boolean | Promise<boolean>

export interface CollectorOptions<P = any> {
  /** The filter applied to this collector */
  filter?: CollectorFilter<P>
  /** How long to run the collector for in milliseconds */
  time?: number
  /** How long to stop the collector after inactivity in milliseconds */
  idle?: number
  /** Whether to dispose data when it's deleted */
  dispose?: boolean
}

export default abstract class Collector<C, D = C> extends EventEmitter {
  collected = new BaseCollection<string, C>()
  ended = false

  _timeout: NodeJS.Timeout | null = null
  _idletimeout: NodeJS.Timeout | null = null
  filter: CollectorFilter<C | D>

  abstract collect(arg: C): Promise<string | null> | string | null
  abstract dispose(arg: D): Promise<string | null> | string | null

  constructor(readonly client: ShardClient, readonly options: CollectorOptions<C | D> = {}) {
    super()
    this.filter = options.filter ?? (() => true)
    if (typeof this.filter !== "function") {
      throw new TypeError("INVALID_TYPE, options.filter, function")
    }
    if (options.time) this._timeout = setTimeout(() => this.stop("time"), options.time).unref()
    if (options.idle) this._idletimeout = setTimeout(() => this.stop("idle"), options.idle).unref()
  }

  //  on(event: "create", listener: (payload: C) => any): this
  //  on(event: "collect", listener: (payload: C) => any): this
  //  on(event: "remove", listener: (payload: D) => any): this
  //  on(event: "dispose", listener: (payload: D) => any): this
  //  on(event: "end", listener: (reason: string) => any): this

  async handleCollect(payload: C) {
    const collect = await this.collect(payload)

    if (collect && (await this.filter(payload, this.collected))) {
      this.collected.set(collect, payload)

      this.emit("collect", payload)

      if (this._idletimeout) {
        clearTimeout(this._idletimeout)
        this._idletimeout = setTimeout(() => this.stop("idle"), this.options.idle).unref()
      }
    }
    this.checkEnd()
  }

  async handleDispose(payload: D) {
    if (!this.options.dispose) return

    const dispose = await this.dispose(payload)
    if (!dispose || !(await this.filter(payload)) || !this.collected.has(dispose)) return
    this.collected.delete(dispose)

    /**
     * Emitted whenever an element is disposed of.
     * @event Collector#dispose
     * @param {...*} args The arguments emitted by the listener
     */
    this.emit("dispose", payload)
    this.checkEnd()
  }

  get next() {
    return new Promise((resolve, reject) => {
      if (this.ended) {
        reject(this.collected)
        return
      }

      const cleanup = () => {
        this.off("collect", onCollect)
        this.off("end", onEnd)
      }

      const onCollect = (item) => {
        cleanup()
        resolve(item)
      }

      const onEnd = () => {
        cleanup()
        reject(this.collected)
      }

      this.on("collect", onCollect)
      this.on("end", onEnd)
    })
  }

  stop(reason = "user") {
    if (this.ended) return

    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout)
      this._idletimeout = null
    }
    this.ended = true

    this.emit("end", this.collected, reason)
  }

  resetTimer({ time, idle }: Pick<CollectorOptions, "time" | "idle"> = {}) {
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = setTimeout(() => this.stop("time"), time ?? this.options.time).unref()
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout)
      this._idletimeout = setTimeout(() => this.stop("idle"), idle ?? this.options.idle).unref()
    }
  }

  checkEnd() {
    const reason = this.endReason
    if (reason) this.stop(reason)
    return Boolean(reason)
  }

  async *[Symbol.asyncIterator]() {
    const queue: any[] = []
    const onCollect = (item: any) => queue.push(item)
    this.on("collect", onCollect)

    try {
      while (queue.length || !this.ended) {
        if (queue.length) {
          yield queue.shift()
        } else {
          await new Promise<void>((resolve) => {
            const tick = () => {
              this.off("collect", tick)
              this.off("end", tick)
              return resolve()
            }
            this.on("collect", tick)
            this.on("end", tick)
          })
        }
      }
    } finally {
      this.off("collect", onCollect)
    }
  }
  get endReason(): string | null {
    return null
  }
}
