import { EventEmitter } from "events"
import { create2DArray, getRowCol, randomNumber } from "../utils"

export enum TileType {
  FLAGGED = "F",
  HIDDEN = "H",
  HIDDEN_MINE = "M",
  MINE = "X",
  MINE_REVEALED = "x",
  EXPLORED = "E",
  // NUMBER,
}

export default class Minesweeper extends EventEmitter {
  arena: (TileType | number)[][]
  moves = 0

  static NEIGHBOUR_OFFSETS: [number, number][] = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],

    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ]

  constructor(readonly ROW: number, readonly COL = ROW, readonly minesCount = COL) {
    super()
    this.arena = create2DArray(ROW, COL, TileType.HIDDEN)
    this.setMines()
  }

  private countMinesInNeighbour(r: number, c: number) {
    let mineCount = 0
    for (const [dx, dy] of Minesweeper.NEIGHBOUR_OFFSETS) {
      if (this.arena[r + dx]?.[c + dy] === TileType.HIDDEN_MINE) mineCount++
    }
    return mineCount
  }

  explore(r: number, c: number) {
    // Out of bound or tile already explored
    if (
      !(r in this.arena && c in this.arena[r]) ||
      this.arena[r][c] == TileType.EXPLORED ||
      typeof this.arena[r][c] == "number"
    )
      return false

    const minesInNeighbour = this.countMinesInNeighbour(r, c)
    if (minesInNeighbour == 0) {
      this.arena[r][c] = TileType.EXPLORED
      for (const [dx, dy] of Minesweeper.NEIGHBOUR_OFFSETS) {
        this.explore(r + dx, c + dy)
      }
    } else {
      this.arena[r][c] = minesInNeighbour
    }
    return true
  }

  revealTile(index: number) {
    const [row, col] = getRowCol(index, this.COL)
    this.moves++
    if (this.arena[row][col] == TileType.HIDDEN_MINE) {
      if (this.moves === 1) {
        this.arena[row][col] = TileType.HIDDEN
      } else {
        this.arena[row][col] = TileType.MINE
        this.revealAllMines()
        this.emit("finish", "mine")
        return
      }
    }
    if (this.explore(row, col)) {
      this.emit("move")
    }
  }
  private revealAllMines() {
    for (let r = 0; r < this.ROW; r++) {
      for (let c = 0; c < this.COL; c++) {
        if (this.arena[r][c] == TileType.HIDDEN_MINE) this.arena[r][c] = TileType.MINE_REVEALED
      }
    }
  }

  setMines() {
    const total = this.ROW * this.COL
    for (let i = 0; i < this.minesCount; i++) {
      const rNum = randomNumber(total)
      const [r, c] = getRowCol(rNum, this.COL)
      this.arena[r][c] = TileType.HIDDEN_MINE
    }
  }
}

abstract class Manager {
  // arena
}
abstract class MultiPlayer extends Manager {
  private turnBool = true
  nextTurn() {
    this.turnBool = !this.turnBool
  }
}
abstract class SinglePlayer extends Manager {}

class Tile {
  static STATUS = {
    MARKED: "0",
    NUMBER: "1",
    HIDDEN: "2",
  }
  private status = Tile.STATUS.HIDDEN
  constructor(
    readonly board: _Minesweeper,
    readonly x: number,
    readonly y: number,
    public hasMine = false
  ) {}

  select() {}
  reveal() {
    // if(this.isHidden)
  }

  get vicinityTiles() {
    return
  }
  get isHidden() {
    return this.status == Tile.STATUS.HIDDEN
  }
  get isRevealed() {
    return !this.isHidden
  }
  toString() {
    switch (this.status) {
      case Tile.STATUS.HIDDEN:
        return this.hasMine ? "*" : "-"
      case Tile.STATUS.MARKED:
        return "#"
      case Tile.STATUS.NUMBER:
        return "."

      default:
        return " "
    }
  }
}
export class _Minesweeper extends SinglePlayer {
  tiles: Tile[][]
  constructor(readonly ROW: number, readonly COL = ROW, readonly minesCount = COL) {
    super()
    this.tiles = this.getNewBoard()
  }
  getNewBoard(): Tile[][] {
    // const tileCount = this.ROW * this.COL
    const mines = Array.from(Array(this.minesCount), () => ({
      x: randomNumber(this.COL),
      y: randomNumber(this.ROW),
    }))
    return Array.from(Array(this.ROW), (_, i) => {
      return Array.from(
        Array(this.COL),
        (_, j) =>
          new Tile(
            this,
            j,
            i,
            mines.some((mine) => mine.x == j && mine.y == i)
          )
      )
    })
  }

  selectTile(tileName: string) {
    // if (tileName.length != 2) return null
    const x = tileName.charCodeAt(0) - 97,
      y = +tileName.slice(1)
    if (x < 0 || isNaN(y)) throw new RangeError("Invalid Tile Name Used.")
    const tile = this.tiles[x][y]
    tile.reveal()
  }
  revealTile(tile: Tile) {}
  toString() {
    return this.tiles.reduce(
      (str, row, i) => row.reduce((str, tile) => `${str + tile} `, str + (i + 1)) + "\n",
      ""
    )
  }
}
