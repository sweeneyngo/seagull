import React, { useEffect, useState, useCallback } from "react";
import { updateCells } from "./utils/run";

import Modal from "./components/Modal/Modal";
import Toolbar from "./components/Toolbar/Toolbar";
import Titlebar from "./components/Titlebar/Titlebar";
import Grid from "./components/Grid/Grid";
import StatisticsBar from "./components/StatisticsBar/StatisticsBar";

import { Mode, CellPosition } from "./types/types";
import './App.css';

function App() {

  const [mode, setMode] = useState<Mode>(Mode.DRAW);
  const [cells, setCells] = useState<Set<string>>(new Set()); // Sparse set; tracks active cells
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [currentCell, setCurrentCell] = useState<CellPosition>({ row: 0, col: 0 });
  const [steps, setSteps] = useState(0);
  const [scale, setScale] = useState(0.8);
  const [interval, setInterval] = useState(50);

  const [rle, setRLE] = useState("");
  const [modal, showModal] = useState(false);


  const handleScale = (newScale: number) => {
    setScale(newScale);
  }

  const handleCurrentCell = (newCurrentCell: CellPosition) => {
    setCurrentCell(newCurrentCell);
  }

  const handleCells = (cells: Set<string>) => {
    setCells(cells);
  }

  const handleMode = (newMode: Mode) => {
    setMode(newMode);
  }

  const handleClear = () => {
    setCells(new Set());
  }

  const handlePlay = () => {

    if (isPlaying) {
      pause();
    }
    else {
      const newIntervalId = window.setInterval(() => handleStep(), interval);
      setIntervalId(newIntervalId);
      setIsPlaying(true);
    }
  }

  const handleStep = () => {
    setCells(prevCells => updateCells(prevCells));
    setSteps(prevSteps => prevSteps + 1);
  }

  const handleSpeed = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInterval(parseInt(event.target.value));
  }

  const handleModal = () => {
    showModal(!modal);
  }

  const handleRLE = (rle: string) => {
    setRLE(rle);
    showModal(false);
  }

  const pause = useCallback(() => {
    if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
    setSteps(0);
  }, [intervalId]);

  useEffect(() => {
    if (cells.size == 0) pause();
  }, [cells, pause])


  return (
    <div className="full">
      {modal && <Modal handleModal={handleModal} handleRLE={handleRLE} />}
      <div className="flex-h">
        <Toolbar
          mode={mode}
          speed={interval}
          isPlaying={isPlaying}
          handleMode={handleMode}
          handleClear={handleClear}
          handlePlay={handlePlay}
          handleStep={handleStep}
          handleSpeed={handleSpeed}
          handleModal={handleModal} />
        <Titlebar />
      </div>
      <Grid
        mode={mode}
        scale={scale}
        cells={cells}
        rle={rle}
        handleCells={handleCells}
        handleScale={handleScale}
        handleCurrentCell={handleCurrentCell} />
      <StatisticsBar
        interval={interval}
        scale={scale}
        steps={steps}
        cells={cells}
        currentCell={currentCell}
      />
    </div>
  );

}

export default App
