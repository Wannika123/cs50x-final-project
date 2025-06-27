import { useState } from "react";
import Buttons from "./Buttons";
import Circle from "./Circle";

export default function CircleAndBtnsWrapper() {
    // The value of 'activeChord' is the 'root note' of the chord
    const [activeChord, setActiveChord] = useState<number | null>(null);
    const [playMode, setPlayMode] = useState<null | "random" | "circle">(null);

    return (
        <>
            <Circle
                activeChord={activeChord}
                setActiveChord={setActiveChord}
                playMode={playMode}
            />
            <Buttons
                activeChord={activeChord}
                setActiveChord={setActiveChord}
                playMode={playMode}
                setPlayMode={setPlayMode}
            />
        </>
    );
}
