import { CSSProperties, useContext, useState } from "react";
import { SoundContext } from "../context/SoundContext";
import type { ChordType } from "../type/type";
import Select from "./Select";

const chordTypeOptions: ChordType[] = ["major", "minor"];

const soundTypeOptions: OscillatorType[] = [
    "sine",
    "triangle",
    "square",
    "sawtooth",
];

export default function SelectContainer() {
    const { changeChordType, changeSoundType } = useContext(SoundContext);

    const [chordTypeVal, setChordTypeVal] = useState<ChordType>("major");
    const [soundTypeVal, setSoundTypeVal] =
        useState<OscillatorType>("triangle");

    const onChordTypeChange = (type: ChordType) => {
        setChordTypeVal(type);
        changeChordType(type);
    };

    const onSoundTypeChange = (type: OscillatorType) => {
        setSoundTypeVal(type);
        changeSoundType(type);
    };

    const styles: CSSProperties = {
        display: "grid",
        gridTemplateColumns: "100px auto",
        justifyContent: "center",
        justifyItems: "left",
        alignItems: "center",
        gap: 10,
    };

    const spanStyles: CSSProperties = {
        justifySelf: "right",
        color: "var(--Paragraph)",
    };

    return (
        <div>
            <div style={{ ...styles, marginBottom: 20 }}>
                <span style={spanStyles}>Chord Type: </span>
                <Select
                    kind="chord"
                    value={chordTypeVal}
                    options={chordTypeOptions}
                    onChange={onChordTypeChange}
                />
            </div>
            <div style={styles}>
                <span style={spanStyles}>Sound Type: </span>
                <Select
                    kind="sound"
                    value={soundTypeVal}
                    options={soundTypeOptions}
                    onChange={onSoundTypeChange}
                />
            </div>
        </div>
    );
}
