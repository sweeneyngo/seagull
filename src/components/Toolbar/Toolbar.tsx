import { FaHandPaper } from "react-icons/fa";
import { FaPencil, FaEraser, FaPlay, FaPause } from "react-icons/fa6";
import { LuTextCursorInput } from "react-icons/lu";
import { TbTrashXFilled } from "react-icons/tb";
import { VscDebugStepOver } from "react-icons/vsc";

import { Mode } from "../../types/types";
import styles from "./Toolbar.module.css";
import React from "react";

type Props = {
    isPlaying: boolean,
    speed: number,
    stepSize: number,
    mode: Mode,
    handleMode: (newMode: Mode) => void,
    handleClear: () => void,
    handlePlay: () => void,
    handleStep: () => void,
    handleSpeed: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleStepSize: (event: React.ChangeEvent<HTMLInputElement>) => void,
    handleModal: () => void,
}

export default function Toolbar({
    isPlaying, speed, stepSize, mode,
    handleMode, handleClear, handlePlay, handleStep, handleSpeed, handleStepSize, handleModal }: Props) {

    return (
        <div className={styles.bar}>
            <div onClick={() => handleMode(Mode.DRAW)}
                className={`${styles.button} ${mode == Mode.DRAW && styles.activeButton}`}>
                <FaPencil />
            </div>
            <div onClick={() => handleMode(Mode.ERASER)}
                className={`${styles.button} ${mode == Mode.ERASER && styles.activeButton}`}>
                <FaEraser />
            </div>
            <div onClick={() => handleMode(Mode.PAN)}
                className={`${styles.button} ${mode == Mode.PAN && styles.activeButton}`}>
                <FaHandPaper />
            </div>
            <div className={styles.vertBar} />
            <div onClick={() => handleClear()}
                className={styles.button}>
                <TbTrashXFilled />
            </div>
            {isPlaying ?
                <div onClick={() => handlePlay()}
                    className={styles.button}>
                    <FaPause />
                </div>
                :
                <div onClick={() => handlePlay()}
                    className={styles.button}>
                    <FaPlay />
                </div>
            }
            <div onClick={() => handleStep()}
                className={styles.button}>
                <VscDebugStepOver />
            </div>
            <div onClick={() => handleModal()}
                className={styles.button}>
                <LuTextCursorInput />
            </div>
            <div className={styles.vertBar} />
            <div className={styles.speedBar}>
                <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={speed}
                    onChange={handleSpeed} />
            </div>
            <div className={styles.vertBar} />
            <div className={styles.speedBar}>
                <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={stepSize}
                    onChange={handleStepSize} />
            </div>
        </div>
    );
};
