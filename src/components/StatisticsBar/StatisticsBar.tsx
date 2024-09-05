import { CellPosition } from "../../types/types";
import styles from "./StatisticsBar.module.css";

type Props = {
    interval: number,
    stepSize: number,
    scale: number,
    steps: number,
    cells: Set<string>,
    currentCell: CellPosition
}

export default function StatisticsBar({ interval, stepSize, scale, steps, cells, currentCell }: Props) {

    const numActive = cells.size;
    const zoom = Math.floor(scale * 100);
    return (
        <div className={styles.bar}>
            <p>{`Step (${steps.toLocaleString()}) • Active (${numActive.toLocaleString()}) | ${(2 ** stepSize).toLocaleString()}x | ${interval}ms | ${zoom}% | (${currentCell.row}, ${currentCell.col})`}</p>
        </div>
    )
}
