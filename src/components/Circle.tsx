import { useContext, useEffect, useRef, useState } from "react";
import { SoundContext } from "../context/SoundContext";
import type { ChordType } from "../type/type";
import { noteNames } from "../global/noteNames";
import styles from "./Circle.module.css";

type Props = {
    activeChord: number | null;
    setActiveChord: React.Dispatch<React.SetStateAction<number | null>>;
    playMode: null | "random" | "circle";
};

export default function Circle({
    activeChord,
    setActiveChord,
    playMode,
}: Props) {
    const { chordType, stopChord, playChord } = useContext(SoundContext);

    const [focusedChord, setFocusedChord] = useState<null | number>(null); // for accessibility
    const [popupOpen, setPopupOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // make an array containing chord name that are 7 semitones (keys) apart (perfect 5th inteval)
    const findCircleArr = (type: ChordType) => {
        const circleArr: { rootNote: number; chordSymbol: string }[] = [];

        // in major case, the chord at 12 o'clock will be C(0) major
        // in minor case, the chord at 12 o'clock will be A(9) minor
        let currentNote = type === "major" ? 0 : 9;

        for (let i = 0; i < 12; i++) {
            const obj: { rootNote: number; chordSymbol: string } = {
                rootNote: 0,
                chordSymbol: "",
            };

            obj.rootNote = currentNote;

            const name = noteNames[currentNote];
            if (type === "major") {
                obj.chordSymbol = name;
            } else {
                // in case of minor, C will be Cm, F#/Gb will be F#m/Gbm etc.
                obj.chordSymbol = name
                    .split("/")
                    .map((n) => n + "m")
                    .join("/");
            }

            circleArr.push(obj);
            currentNote = (currentNote + 7) % 12;
        }
        return circleArr;
    };

    const playSound = (note: number) => {
        if (playMode != null) return; // Meaning: chords are being played automatically
        if (note === activeChord) return; // If users click the same chord, nothing should happen
        playChord(note);
        setActiveChord(note);
    };

    const stopSound = () => {
        if (playMode != null) return;
        setFocusedChord(null);
        setActiveChord(null);
        stopChord();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target !== containerRef.current) return;

            switch (e.code) {
                case "ArrowUp":
                case "ArrowRight":
                case "ArrowDown":
                case "ArrowLeft": {
                    let rootNote: number;
                    if (focusedChord === null) {
                        rootNote = chordType === "major" ? 0 : 9;
                    } else {
                        rootNote =
                            e.code === "ArrowRight" || e.code === "ArrowUp"
                                ? (focusedChord + 7) % 12
                                : (focusedChord + 5) % 12;
                    }
                    setFocusedChord(rootNote);
                    break;
                }
                case "Enter":
                case "Space":
                    if (focusedChord !== null) {
                        setActiveChord(focusedChord);
                        playChord(focusedChord);
                    }
                    break;
            }
        };
        containerRef.current?.addEventListener("keydown", handler);

        return () => {
            containerRef.current?.removeEventListener("keydown", handler);
        };
    }, [focusedChord]);

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className={`${styles.container} ${
                activeChord !== null ? styles.active : undefined
            }`}
            onMouseLeave={stopSound}
            onBlur={stopSound}
        >
            <div className={styles["popup-container"]}>
                <button
                    aria-label="open instruction"
                    onClick={() => setPopupOpen(true)}
                    onBlur={() => setPopupOpen(false)}
                >
                    ?
                </button>
                <p className={`${popupOpen ? styles.show : undefined}`}>
                    Click chord symbols to hear the sound of the chord. The
                    sound will sustain as long as the mouse stay in the circle.
                    (C is the symbol for C Major chord, Cm is the symbol for C
                    Minor chord)
                </p>
            </div>
            <div className={styles["musical-note"]}></div>
            {findCircleArr(chordType).map((obj, i) => (
                <div
                    className={`${styles["chord-container"]}`}
                    style={{ transform: `rotate(${30 * i}deg)` }}
                    key={`chord: ${obj.chordSymbol}`}
                >
                    <div className={styles.dash}></div>
                    <div
                        className={`${styles["chord-name"]} ${
                            activeChord === obj.rootNote
                                ? styles["active-chord"]
                                : undefined
                        } ${playMode != null ? styles.disabled : ""} ${
                            focusedChord === obj.rootNote
                                ? styles["focused-chord"]
                                : ""
                        }`}
                        style={{ transform: `rotate(${-30 * i}deg)` }}
                        onClick={() => {
                            playSound(obj.rootNote);
                        }}
                    >
                        {obj.chordSymbol.length > 2
                            ? obj.chordSymbol.replace("/", "/\n")
                            : obj.chordSymbol}
                    </div>
                </div>
            ))}
        </div>
    );
}
