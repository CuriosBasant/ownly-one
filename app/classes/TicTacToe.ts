import GameManager from "./GameManager"

export const enum TileType {
  EMPTY,
  CROSS,
  NOUGHT,
}

export default class TicTacToe extends GameManager {
  arena = Array(9).fill(TileType.EMPTY)
  constructor() {
    super()
  }

  move(index: number) {
    if (!this.canMove(index)) return
    this.arena[index] = this.firstTurn ? TileType.CROSS : TileType.NOUGHT
    this._lastIndex = index

    if (this.checkWin()) {
      this.emit("finish", "win")
      return
    } else if (this.moves == 8) {
      this.emit("finish", "draw")
      return
    }

    this.switchTurn()
    this.emit("move")
  }

  private canMove(index: number) {
    return this.arena[index] === TileType.EMPTY
  }

  private checkWin() {
    // const side = this.arena[this.lastIndex]
    // check rows
    for (let i = 0; i < 9; i += 3) {
      if (
        this.arena[i] != TileType.EMPTY &&
        this.arena[i] == this.arena[i + 1] &&
        this.arena[i] == this.arena[i + 2]
      )
        return true
    }
    // check cols
    for (let i = 0; i < 3; i += 1) {
      if (
        this.arena[i] != TileType.EMPTY &&
        this.arena[i] == this.arena[i + 3] &&
        this.arena[i] == this.arena[i + 6]
      )
        return true
    }

    // check diagnols
    return (
      this.arena[4] != TileType.EMPTY &&
      ((this.arena[0] == this.arena[4] && this.arena[0] == this.arena[8]) ||
        (this.arena[2] == this.arena[4] && this.arena[2] == this.arena[6]))
    )
  }
}
