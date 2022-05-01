export function create2DArray(row: number, col: number): null[][]
export function create2DArray<T>(row: number, col: number, fill: T): T[][]
export function create2DArray(row: number, col: number, fill = null) {
  return Array.from(Array(row), () => Array(col).fill(fill))
}
