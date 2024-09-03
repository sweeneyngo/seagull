import { CellPosition } from "../../types/types";
import styles from "./StatisticsBar.module.css";

type Props = {
    interval: number,
    scale: number,
    steps: number,
    cells: Set<string>,
    currentCell: CellPosition
}

export default function StatisticsBar({ interval, scale, steps, cells, currentCell }: Props) {

    const numActive = cells.size;
    const zoom = Math.floor(scale * 100);
    return (
        <div className={styles.bar}>
            <p>{`Step (${steps}) • Active (${numActive}) | ${interval}ms | ${zoom}% | (${currentCell.row}, ${currentCell.col})`}</p>
        </div>
    )
}
