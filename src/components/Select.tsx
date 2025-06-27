import { useState, useRef, useEffect, useContext } from "react";
import styles from "./Select.module.css";
import type { ChordType } from "../type/type";
import { SoundContext } from "../context/SoundContext";

// I use chatGPT to help me fix TS errors of this component.
// At first, I don't know how to make TS infer which type of onChange() to be used.

type ChordTypeSelect = {
    kind: "chord";
    value: ChordType;
    options: ChordType[];
    onChange: (type: ChordType) => void;
};

type SoundTypeSelect = {
    kind: "sound";
    value: OscillatorType;
    options: OscillatorType[];
    onChange: (type: OscillatorType) => void;
};

type SelectProps = ChordTypeSelect | SoundTypeSelect;

export default function Select({
    kind,
    value,
    options,
    onChange,
}: SelectProps) {
    const { currChord } = useContext(SoundContext);

    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    const selectOption = (type: ChordType | OscillatorType) => {
        if (kind === "chord") {
            onChange(type as ChordType);
        } else {
            onChange(type as OscillatorType);
        }
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target != containerRef.current) return;

            switch (e.code) {
                case "Enter":
                case "Space":
                    setIsOpen((prev) => !prev);
                    if (isOpen) selectOption(options[highlightedIndex]);
                    break;
                case "ArrowUp":
                case "ArrowDown": {
                    // add curly bracket so that the variable remain in this scope
                    if (!isOpen) {
                        setIsOpen(true);
                        break;
                    }
                    const newValue =
                        highlightedIndex + (e.code === "ArrowDown" ? 1 : -1);
                    if (newValue >= 0 && newValue < options.length) {
                        setHighlightedIndex(newValue);
                    }
                    break;
                }
                case "Escape":
                    setIsOpen(false);
                    break;
            }
        };
        containerRef.current?.addEventListener("keydown", handler);

        return () => {
            containerRef.current?.removeEventListener("keydown", handler);
        };
    }, [isOpen, highlightedIndex]);

    useEffect(() => {
        if (currChord.bass !== null) {
            setIsOpen(false);
        }
    }, [currChord.bass]);

    return (
        <div
            ref={containerRef}
            onBlur={() => setIsOpen(false)}
            onClick={() => {
                if (currChord.bass !== null) return;
                setIsOpen((prev) => !prev);
            }}
            tabIndex={0}
            className={`${styles.container} ${
                currChord.bass != null ? styles.disabled : ""
            }`}
        >
            <span className={styles.value}>{value}</span>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
                {options.map((option, index) => (
                    <li
                        onClick={(e) => {
                            e.stopPropagation();
                            selectOption(option);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        key={option}
                        className={`${styles.option} ${
                            option === value ? styles.selected : ""
                        } ${
                            highlightedIndex === index ? styles.highlighted : ""
                        }`}
                    >
                        {option}
                    </li>
                ))}
            </ul>
        </div>
    );
}
