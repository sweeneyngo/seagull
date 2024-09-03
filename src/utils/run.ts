function countNeighbors(cells: Set<string>, row: number, col: number): number {

    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    let neighbors = 0;

    for (const [deltaRow, deltaCol] of directions) {
        const newRow = row + deltaRow;
        const newCol = col + deltaCol;

        if (cells.has(`${newRow},${newCol}`)) {
            neighbors += 1
        }
    }

    return neighbors;
}

function getNeighbors(row: number, col: number): string[] {

    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    return directions.map(([deltaRow, deltaCol]) => `${row + deltaRow},${col + deltaCol}`);
}

export function updateCells(cells: Set<string>): Set<string> {

    const newCells = new Set(cells);
    const candidateCells = new Set<string>(); // Track all possible active cells in next iteration.

    // For current active cells & their neighbors, add to candidateCells.
    cells.forEach(cell => {

        const [row, col]: number[] = cell.split(",").map(Number);
        candidateCells.add(cell); // Add all current cells

        const neighbors = getNeighbors(row, col);
        neighbors.forEach(neighbor => candidateCells.add(neighbor));
    })

    candidateCells.forEach(candidateCell => {

        const [row, col]: number[] = candidateCell.split(",").map(Number);
        const neighbors = countNeighbors(cells, row, col);


        if (cells.has(candidateCell)) {
            // Alive cell
            if (neighbors < 2 || neighbors > 3) {
                newCells.delete(candidateCell);
            }
        }
        else {
            // Dead cell
            if (neighbors === 3) {
                newCells.add(candidateCell);
            }
        }
    });

    return newCells;
}
