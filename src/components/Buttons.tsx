import { useContext, useEffect, useState } from "react";
import { SoundContext } from "../context/SoundContext";
import { ChangeEvent } from "react";
import styles from "./Buttons.module.css";

type Props = {
    activeChord: number | null;
    setActiveChord: React.Dispatch<React.SetStateAction<number | null>>;
    playMode: null | "random" | "circle";
    setPlayMode: React.Dispatch<
        React.SetStateAction<"random" | "circle" | null>
    >;
};

export default function Buttons({
    setActiveChord,
    activeChord,
    playMode,
    setPlayMode,
}: Props) {
    const { playChord, stopChord, chordType } = useContext(SoundContext);

    const [seconds, setSeconds] = useState<number | undefined>(1);

    const changeSpeed = (e: ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);

        if (val === 0) {
            // get rid of the leading zero
            setSeconds(undefined);
        } else {
            setSeconds(val);
        }
    };

    const startSound = (mode: "random" | "circle") => {
        if (activeChord != null) return;

        setPlayMode(mode);
    };

    const stopSound = () => {
        setPlayMode(null);
        setActiveChord(null);
        stopChord();
    };

    useEffect(() => {
        if (playMode === null) return;

        // starting playing immediately
        if (activeChord === null) {
            // always start with the chord at 12 o'clock
            const rootNote = chordType === "major" ? 0 : 9;
            setActiveChord(rootNote);
            playChord(rootNote);
        }

        const chordSequence = setInterval(() => {
            let rootNote: number;

            // just in case 'activeChord' is not updated yet
            if (activeChord === null) {
                rootNote = chordType === "major" ? 0 : 9;
            } else {
                if (playMode === "random") {
                    rootNote = Math.floor(Math.random() * 12);
                    while (rootNote === activeChord) {
                        rootNote = Math.floor(Math.random() * 12);
                    }
                } else {
                    rootNote = (activeChord + 7) % 12;
                }
            }
            setActiveChord(rootNote);
            playChord(rootNote);
        }, (seconds ? seconds : 0.1) * 1000);

        return () => clearInterval(chordSequence);
    }, [playMode, activeChord]);

    return (
        <div className={styles.container}>
            <div className={styles["input-container"]}>
                <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={seconds}
                    onChange={changeSpeed}
                    onBlur={() => {
                        if (seconds === undefined || seconds < 0.1) {
                            setSeconds(0.1);
                        }
                    }}
                    disabled={playMode != null}
                />
                <span>seconds per chord</span>
            </div>
            <div className={styles["btns-container"]}>
                <button
                    onClick={() => startSound("circle")}
                    className={playMode != null ? styles["disabled-btn"] : ""}
                    disabled={playMode != null}
                >
                    Play Circle of Fifth
                </button>
                <button
                    onClick={() => startSound("random")}
                    className={playMode != null ? styles["disabled-btn"] : ""}
                    disabled={playMode != null}
                >
                    Play Randomly
                </button>
                <button
                    onClick={stopSound}
                    disabled={playMode === null}
                    className={playMode === null ? styles["disabled-btn"] : ""}
                >
                    Stop
                </button>
            </div>
        </div>
    );
}
