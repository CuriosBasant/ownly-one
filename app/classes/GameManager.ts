import EventEmitter from "events"

export default class GameManager extends EventEmitter {
  private _firstTurn = true

  protected _lastIndex = -1
  private _moves = 0

  protected switchTurn() {
    this._moves++
    this._firstTurn = !this._firstTurn
  }
  get moves() {
    return this._moves
  }
  get lastIndex() {
    return this._lastIndex
  }
  get firstTurn() {
    return this._firstTurn
  }
}
