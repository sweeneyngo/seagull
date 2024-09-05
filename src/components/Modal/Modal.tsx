import { useState, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { IoSend } from "react-icons/io5";

import data from "../../utils/rle.json";

import styles from "./Modal.module.css";

type RLEData = {
    [key: string]: RLEPattern;
};

type RLEPattern = {
    pattern: string,
    uri: string
};

type Props = {
    handleModal: () => void,
    handleRLE: (rle: string) => void
};

export default function Modal({ handleModal, handleRLE }: Props) {

    const [input, setInput] = useState("");
    const [patterns, setPatterns] = useState<RLEData>({})
    const [pattern, setPattern] = useState<string>("");

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleRLE(input);
        }
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    }

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPattern(patterns[event.target.value].pattern);
    };


    useEffect(() => {
        setPatterns(data);
    }, []);

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modal}>
                <div className={styles.vert}>
                    <div className={styles.titlebar}>
                        <h1>Submit a RLE...</h1>
                        <div onClick={() => handleModal()}><IoMdCloseCircle /></div>
                    </div>
                    <div className={styles.horiBar}></div>
                    <p className={styles.description}>Run Length Encoding (RLE) is used to store CGOL patterns. Learn <a href="https://conwaylife.com/wiki/Run_Length_Encoded">more</a> about formatting & reading MLEs. Obtain a MLE from the <a href="https://conwaylife.com/patterns/all.zip">LifeWiki!</a></p>
                    <div className={styles.hori}>
                        <input
                            onKeyDown={(event) => handleKeyDown(event)}
                            onChange={(event) => handleInput(event)}
                            type="text"
                            id="name"
                            name="name"
                            placeholder="bo$2bo$3o!" />
                        <div onClick={() => handleRLE(input)} className={styles.button}>
                            <IoSend />
                        </div>
                    </div>
                    <div className={styles.dropdown}>
                        <select
                            onChange={(event) => handleChange(event)}
                            id="dropdown"
                            name="dropdown"
                        >
                            <option value="">Select an option...</option>
                            {Object.keys(patterns).map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                        <div onClick={() => handleRLE(pattern)} className={styles.button}>
                            <IoSend />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
