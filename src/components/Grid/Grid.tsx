import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mode, Position, CellPosition, Size } from "../../types/types";
import { getCell } from "../../utils/canvas";
import styles from "./Grid.module.css";
import { Universe } from "../../utils/run";

const HEIGHT = 500;
const WIDTH = 500;
const CELL_SIZE = 20;
const SCALE_STEP = 0.1;

type Grid = {
    context: CanvasRenderingContext2D | null,
    height: number,
    width: number,
};

/*
 * cells: Always keep active cells in World space, not screen/canvas space.
 * Each cell captures the (row, col) which is (x, y) scaled by CELL_SIZE.
 * Unlike cells, mouse events are based on (x, y).
 */
type Draw = {
    context: CanvasRenderingContext2D | null,
    cells: Set<string>
}

type Props = {
    universe: Universe,
    mode: Mode,
    scale: number,
    cells: Set<string>,
    rle: string,
    handleClear: () => void,
    handleCells: (cells: Set<string>) => void,
    handleScale: (newScale: number) => void,
    handleCurrentCell: (pos: CellPosition) => void
}

export default function Grid({ universe, mode, scale, cells, rle, handleClear, handleCells, handleScale, handleCurrentCell }: Props) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [size, setSize] = useState<Size>({ height: 500, width: 500 });
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
    const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });

    const drawGrid = useCallback(({ context, height, width }: Grid) => {

        /* NOTE:
         * Drawing the grid is a fixed array of vert + hori lines based on the canvas.
         * When drawing the grid, the offset shouldn't matter.
         */

        if (!context) return;

        context.clearRect(0, 0, width / scale, height / scale); // Clear canvas
        context.strokeStyle = "#9c9d9e"; // --primary-gray
        context.lineWidth = 0.5;

        const delta = 0.5;
        const numRows = Math.ceil(height / scale / CELL_SIZE);
        const numCols = Math.ceil(width / scale / CELL_SIZE);

        if (scale < 0.2) return;

        // Draw horizontal lines
        for (let row = 0; row <= numRows; row += 1) {

            const s = 0;
            const x = width / scale;
            const y = (row * scale * CELL_SIZE) - ((offset.y % CELL_SIZE) * scale) + delta;

            context.beginPath();
            context.moveTo(s, y);
            context.lineTo(x, y);
            if (scale > 0.2) context.stroke();
        }

        // Draw vertical lines
        for (let col = 0; col <= numCols; col += 1) {

            const s = 0;
            const x = (col * scale * CELL_SIZE) - ((offset.x % CELL_SIZE) * scale) + delta;
            const y = height / scale;

            context.beginPath();
            context.moveTo(x, s);
            context.lineTo(x, y);
            if (scale > 0.2) context.stroke();
        }
    }, [scale, offset]);

    const drawCells = useCallback(({ context, cells }: Draw) => {

        if (!context) return;

        context.fillStyle = "#000";
        cells.forEach(cell => {

            const [row, col] = cell.split(",").map(Number);
            const size = CELL_SIZE * scale;

            // Scale (row, col) by cell size & scale (at cell-level).
            // scale offset (x, y) by scale (at pixel-level).

            const x = row * size - (offset.x * scale);
            const y = col * size - (offset.y * scale);
            const w = size;
            const h = size;

            context.beginPath();
            context.fillRect(x, y, w, h);
            context.fill();
        });

    }, [scale, offset]);

    const parseRLE = (rle: string): Set<string> => {

        const newCells = new Set<string>();

        const canvas = canvasRef.current;
        if (!canvas) return newCells;

        // const { clientHeight: height, clientWidth: width } = canvas.parentElement || { clientHeight: HEIGHT, clientWidth: WIDTH };

        // const centerX = Math.floor(width / 2 / CELL_SIZE);
        // const centerY = Math.floor(height / 2 / CELL_SIZE);

        let x = 0;
        let y = 0;

        const rows = rle.split("$");

        // Clear universe.
        handleClear();

        rows.forEach(row => {
            let num = "";
            for (let index = 0; index < row.length; index += 1) {

                const char = row[index];
                if (char === "o") {
                    const freq = (num === "") ? 1 : parseInt(num);
                    for (let count = 0; count < freq; count += 1) {
                        x++;
                        universe.setCell(x, y, 1);
                        newCells.add(`${x},${y}`);
                    }
                    num = "";
                }
                else if (char === 'b') {
                    const freq = (num === "") ? 1 : parseInt(num);
                    for (let count = 0; count < freq; count += 1) {
                        x++;
                    }
                    num = "";
                }
                else if (char >= '0' && char <= '9') {
                    num += char;
                }
                else if (char === '!') {
                    break;
                }
            }

            const freq = (num === "") ? 1 : parseInt(num);
            for (let count = 0; count < freq; count += 1) {
                y++;
            }

            x = 0;
        });

        return newCells;
    }

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
        const canvas = canvasRef.current;

        const cell = getCell(canvas, event, scale, CELL_SIZE, offset, size);
        if (!cell) return;

        const cellKey = `${cell.row},${cell.col}`; // Convert to string, valid index to set

        if (mode === Mode.DRAW && cells.has(cellKey)) return;
        if (mode === Mode.ERASER && !cells.has(cellKey)) return;

        const newCells = new Set(cells);

        if (mode == Mode.DRAW) {
            newCells.add(cellKey);
            universe.setCell(cell.row, cell.col, 1);
        }
        if (mode == Mode.ERASER) {
            newCells.delete(cellKey);
            universe.setCell(cell.row, cell.col, 0);
        }

        handleCells(newCells);
    }

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragPosition({ x: event.clientX, y: event.clientY });
        handleClick(event);
    }, [handleClick]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (isDragging) {
            if (mode === Mode.PAN) {
                const dx = event.clientX - dragPosition.x;
                const dy = event.clientY - dragPosition.y;

                setOffset(prevOffset => ({
                    x: prevOffset.x - dx / scale,
                    y: prevOffset.y - dy / scale
                }));

                setDragPosition({ x: event.clientX, y: event.clientY })
            }

            handleClick(event);
        }

        const canvas = canvasRef.current;
        const cell = getCell(canvas, event, scale, CELL_SIZE, offset, size);
        if (!cell) return;
        handleCurrentCell(cell);
    }, [handleClick]);

    const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
        // Calculate the delta to determine zoom direction
        const delta = -event.deltaY;
        const zoomFactor = delta > 0 ? (1 + SCALE_STEP) : 1 / (1 + SCALE_STEP);
        const newScale = scale * zoomFactor;

        handleScale(Math.min(1.0, Math.max(0.1, newScale)));
    }

    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { clientHeight: height, clientWidth: width } = canvas.parentElement || { clientHeight: HEIGHT, clientWidth: WIDTH };

        setSize({ height, width });

        const context = canvas.getContext("2d");
        if (context) {
            drawGrid({ context, height, width });
            drawCells({ context, cells });
        }
    }

    // Event listeners for "dragging" mouse movement
    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const newCells = parseRLE(rle);
        handleCells(newCells);
    }, [rle]);

    // Draw grid
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        const height = size.height;
        const width = size.width;

        canvas.height = height;
        canvas.width = width;

        drawGrid({ context, height, width });
        drawCells({ context, cells });
    }, [size, scale, cells, offset, drawGrid, drawCells]);

    return (
        <div className={`${styles.grid} ${mode === Mode.PAN && styles.pan}`}>
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown} />
        </div>
    )
}
