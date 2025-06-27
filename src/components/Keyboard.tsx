import { useContext, useEffect, useRef, useState } from "react";
import { entireRange } from "../global/range";
import { noteNames } from "../global/noteNames";
import styles from "./Keyboard.module.css";
import { SoundContext } from "../context/SoundContext";

export default function Keyboard() {
    const { playNote, currChord } = useContext(SoundContext);

    const [focusIndex, setFocusIndex] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const isWhiteKey = (note: number) => {
        const remainder = note % 12;
        if (
            remainder === 0 ||
            remainder === 2 ||
            remainder === 4 ||
            remainder === 5 ||
            remainder === 7 ||
            remainder === 9 ||
            remainder === 11
        ) {
            return true;
        }
        return false;
    };

    const findLabel = (note: number) => {
        const octave = Math.floor(note / 12) + 2;
        const name = noteNames[note % 12];

        // black keys (e.g. C#/Db)
        if (name.length > 1) {
            const arr = name.split("/");
            return arr.map((n) => n + octave).join("/\n");
        }
        return name + octave;
    };

    const isPlaying = (note: number) => {
        const notes = Object.values(currChord);

        if (notes.includes(note)) {
            return true;
        }
        return false;
    };

    const playKeyboard = (note: number) => {
        if (currChord.bass !== null) return;
        playNote(note);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target !== containerRef.current) return;

            switch (e.code) {
                case "ArrowUp":
                case "ArrowRight":
                case "ArrowDown":
                case "ArrowLeft": {
                    if (focusIndex === null) {
                        const index =
                            e.code === "ArrowUp" || e.code === "ArrowRight"
                                ? 5
                                : 40;
                        setFocusIndex(index);
                    } else {
                        let newIndex =
                            focusIndex +
                            (e.code === "ArrowUp" || e.code === "ArrowRight"
                                ? 1
                                : -1);
                        if (newIndex > 40) newIndex = 5;
                        if (newIndex < 5) newIndex = 40;
                        setFocusIndex(newIndex);
                    }
                    break;
                }
                case "Enter":
                case "Space":
                    if (focusIndex === null) return;
                    playKeyboard(focusIndex);
                    break;
            }
        };
        containerRef.current?.addEventListener("keydown", handler);

        return () => {
            containerRef.current?.removeEventListener("keydown", handler);
        };
    }, [focusIndex]);

    return (
        <div
            className={styles.container}
            ref={containerRef}
            tabIndex={0}
            onBlur={() => setFocusIndex(null)}
        >
            {entireRange.map((note) => {
                if (isWhiteKey(note)) {
                    // A white key and a black that follow will be nested in a parent div, this is for positioning.
                    return (
                        <div className={styles["key-container"]} key={note}>
                            <div
                                className={`${styles["white-key"]} ${
                                    isPlaying(note) ? styles.playing : undefined
                                } ${
                                    focusIndex === note
                                        ? styles.focused
                                        : undefined
                                }`}
                                onClick={() => playKeyboard(note)}
                            >
                                <span className={styles["key-label"]}>
                                    {findLabel(note)}
                                </span>
                            </div>

                            {/* E and B have no black key that immediately follow */}
                            {note % 12 !== 4 && note % 12 !== 11 && (
                                <div
                                    className={`${styles["black-key"]} ${
                                        isPlaying(note + 1)
                                            ? styles.playing
                                            : undefined
                                    } ${
                                        focusIndex === note + 1
                                            ? styles.focused
                                            : undefined
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playKeyboard(note + 1);
                                    }}
                                >
                                    <span className={styles["key-label"]}>
                                        {findLabel(note + 1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                }
            })}
        </div>
    );
}
