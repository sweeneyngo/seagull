import { CellPosition, Position, Size } from "../types/types";

export function getCell(
    canvas: HTMLCanvasElement | null,
    event: React.MouseEvent<HTMLCanvasElement> | MouseEvent,
    scale: number,
    cellSize: number,
    offset: Position,
    size: Size
): CellPosition | null {

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left + offset.x * scale; // Screen -> World space
    const y = event.clientY - rect.top + offset.y * scale; // Screen -> World space

    const numRows = Math.ceil(size.width / (cellSize * scale));
    const numCols = Math.ceil(size.height / (cellSize * scale));

    const beginRow = Math.floor((offset.x) / cellSize);
    const beginCol = Math.floor((offset.y) / cellSize);

    const endRow = beginRow + numRows;
    const endCol = beginCol + numCols;

    const row = Math.floor(x / scale / cellSize);
    const col = Math.floor(y / scale / cellSize);

    // console.log(row, col, offset.x, offset.y, beginRow, beginCol, endRow, endCol);
    if (row < beginRow || col < beginCol || row > endRow || col > endCol) return null;

    return { row, col }
}
