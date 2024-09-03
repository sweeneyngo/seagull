// Sets the action mode for the grid.
export enum Mode {
    DRAW = 0,
    ERASER = 1,
    PAN = 2
}

export type CellPosition = {
    row: number,
    col: number
};

export type Position = {
    x: number,
    y: number
};

export type Size = {
    height: number,
    width: number,
}
