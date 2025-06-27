import { createContext, useState } from "react";
import type {
    ChordType,
    CurrChord,
    Oscs,
    Triad,
    Voicing,
    Choices,
} from "../type/type";
import { startingRange, range } from "../global/range";
import { findFrequency } from "../global/frequency";
import { isWithinRange } from "../global/range";

const actx = new AudioContext();
const out = actx.destination;

const initialCurrChord: CurrChord = {
    bass: null,
    tenor: null,
    alto: null,
    soprano: null,
};

const initialOscs: Oscs = {
    bassOsc: null,
    tenorOsc: null,
    altoOsc: null,
    sopranoOsc: null,
};

// =============== CONTEXT ====================

type SoundContextType = {
    chordType: ChordType;
    currChord: CurrChord;
    changeChordType: (type: ChordType) => void;
    changeSoundType: (type: OscillatorType) => void;
    playNote: (note: number) => void;
    playChord: (rootNote: number) => void;
    stopChord: () => void;
};

const SoundContext = createContext<SoundContextType>({
    chordType: "major",
    currChord: initialCurrChord,
    changeChordType: (type: ChordType) => console.log(type),
    changeSoundType: (type: OscillatorType) => console.log(type),
    playNote: (note: number) => console.log(note),
    playChord: (rootNote: number) => console.log(rootNote),
    stopChord: () => {},
});

function SoundProvider({ children }: { children: React.ReactNode }) {
    const [chordType, setChordType] = useState<ChordType>("major");
    const [soundType, setSoundType] = useState<OscillatorType>("triangle");
    const [currChord, setCurrChord] = useState<CurrChord>(initialCurrChord);
    const [oscs, setOscs] = useState<Oscs>(initialOscs);

    const changeChordType = (type: ChordType) => {
        setChordType(type);
    };

    const changeSoundType = (type: OscillatorType) => {
        setSoundType(type);
    };

    const playNote = (note: number) => {
        if (currChord.bass !== null) return;

        // simply to trigger styles change on the keyboard
        setCurrChord((prevState) => ({ ...prevState, soprano: note }));

        // 'Oscillator Node' doesn't have to be stored in 'oscs' state, because it doesn't need to get access again.
        const time = actx.currentTime;
        const oscNode = actx.createOscillator();
        const gainNode = actx.createGain();

        oscNode.frequency.value = findFrequency(note);
        oscNode.type = soundType;
        gainNode.gain.value = 0.5;
        oscNode.connect(gainNode);
        gainNode.connect(out);

        oscNode.start(time);
        oscNode.stop(time + 0.5);

        setTimeout(() => {
            setCurrChord(initialCurrChord);
        }, 500);
    };

    //================== VOICING FUNCTION ========================
    const voicing = (nextTriad: Triad): Voicing => {
        const findStartingChord = (): Voicing => {
            const startingBass = isWithinRange(nextTriad[0], startingRange.bass)
                ? nextTriad[0]
                : nextTriad[0] + 12;

            const startingTenorChoices: number[] = [];

            for (
                let i = startingRange.tenor[0];
                i <= startingRange.tenor[1];
                i++
            ) {
                if (nextTriad.includes(i % 12)) {
                    startingTenorChoices.push(i);
                }
            }

            const findUpperVoice = (lowerVoice: number) => {
                const triadIndex = nextTriad.indexOf(lowerVoice % 12);
                // simply brute force
                return (
                    lowerVoice +
                    (triadIndex === 0 ? 7 : 0) +
                    (triadIndex === 1 ? (chordType === "major" ? 8 : 9) : 0) +
                    (triadIndex === 2 ? (chordType === "major" ? 9 : 8) : 0)
                );
            };

            for (let i = 0; i < startingTenorChoices.length; i++) {
                const startingTenor = startingTenorChoices[i];

                const startingAlto = findUpperVoice(startingTenor);
                const startingSoprano = findUpperVoice(startingAlto);

                if (
                    isWithinRange(startingAlto, startingRange.alto) &&
                    isWithinRange(startingSoprano, startingRange.soprano)
                ) {
                    return [
                        startingBass,
                        startingTenor,
                        startingAlto,
                        startingSoprano,
                    ];
                }
            }
            // It will never come to this line though.
            return [3, 3, 3, 3];
        };

        // The starting chord
        if (
            currChord.bass === null ||
            currChord.tenor === null ||
            currChord.alto === null ||
            currChord.soprano === null
        ) {
            return findStartingChord();
        }

        // The rest in this function is the algorithm for when it's NOT the starting chord,
        // where the previous chord has to be considered when choosing the note in each line for the next chord

        const findBass = (choices: number[]) => {
            if (currChord.bass === null) return 0; // This is simply to trick TS that it can't return undefined, and at this point, it can't be 'null' anyway.

            // Strict rules:
            // Bass line must not jump over perfect 5th interval
            // Bass line must not be tritone
            // Bass note is within the range
            for (let i = 0; i < choices.length; i++) {
                if (
                    Math.abs(currChord.bass - choices[i]) <= 7 &&
                    Math.abs(currChord.bass - choices[i]) !== 6 &&
                    isWithinRange(choices[i], range.bass)
                ) {
                    return choices[i];
                }
            }

            // Lenient rules:
            // Bass line must not jump over major 6th interval
            // Bass line must not be tritone
            // Bass note is within the range
            for (let i = 0; i < choices.length; i++) {
                if (
                    Math.abs(currChord.bass - choices[i]) <= 9 &&
                    Math.abs(currChord.bass - choices[i]) !== 6 &&
                    isWithinRange(choices[i], range.bass)
                ) {
                    return choices[i];
                }
            }

            // Fallback (Tritone is unavoidable in some case)
            return isWithinRange(choices[0], range.bass)
                ? choices[0]
                : choices[1];
        };

        // First 2 values are root note (different octave), last 2 values are 3rd note (different octave)
        const bassChoices = [
            nextTriad[0],
            nextTriad[0] + 12,
            nextTriad[1],
            nextTriad[1] + 12,
        ];
        let bassNote = findBass(bassChoices);

        // This is for tenor, alto and soprano lines
        const findChoices = (currNote: number, range: number[]) => {
            const choices: Choices = {
                good: [],
                notVeryGood: [],
                bad: [],
            };
            for (let note = range[0]; note <= range[1]; note++) {
                if (nextTriad.includes(note % 12)) {
                    const interval = Math.abs(currNote - note);
                    if (interval <= 2) {
                        choices.good.push(note);
                    } else if (interval <= 4) {
                        choices.notVeryGood.push(note);
                    } else if (interval === 5) {
                        choices.bad.push(note);
                    }
                }
            }
            return choices;
        };

        const tenorChoices = findChoices(currChord.tenor, range.tenor);
        const altoChoices = findChoices(currChord.alto, range.alto);
        const sopranoChoices = findChoices(currChord.soprano, range.soprano);

        const isCompleteTriad = (voicing: Voicing, isStrict: boolean) => {
            // For 4-part voicing, for simple triad,
            // it's best if it's consisted of 2 root note, 1 third note and 1 fifth note
            // But it's ok if it's consisted of 1 root note, 2 third note and 1 fifth note
            // 1 root note, 1 third note and 2 fifth note
            // Or 3 root note and 1 third note
            // (Note that when musicians call second note, third note etc., they mean 'a single note'.
            // Third note means the note that is major 3rd or minor 3rd from the root.)
            const qualifiedNoteChoices = isStrict
                ? [{ root: 2, third: 1, fifth: 1 }]
                : [
                      { root: 2, third: 1, fifth: 1 },
                      { root: 1, third: 2, fifth: 1 },
                      { root: 1, third: 1, fifth: 2 },
                      { root: 3, third: 1, fifth: 0 },
                  ];

            let root = 0;
            let third = 0;
            let fifth = 0;

            for (let i = 0; i < voicing.length; i++) {
                const note = voicing[i] % 12;
                if (note === nextTriad[0]) {
                    root++;
                } else if (note === nextTriad[1]) {
                    third++;
                } else {
                    fifth++;
                }
            }

            for (let i = 0; i < qualifiedNoteChoices.length; i++) {
                if (
                    qualifiedNoteChoices[i].root === root &&
                    qualifiedNoteChoices[i].third === third &&
                    qualifiedNoteChoices[i].fifth === fifth
                ) {
                    return true;
                }
            }
            return false;
        };

        const noOverlap = (voicing: Voicing) => {
            // bass must not be higher than tenor, tenor must not be higher than alto, ...
            for (let i = 1; i < voicing.length; i++) {
                if (voicing[i - 1] >= voicing[i]) {
                    return false;
                }
            }
            return true;
        };

        const notTooFarApart = (voicing: Voicing) => {
            // tenor-alto and alto-soprano must not be more than an octave apart
            if (voicing[2] - voicing[1] > 12 || voicing[3] - voicing[2] > 12) {
                return false;
            }
            return true;
        };

        const noPerfectParallel = (voicing: Voicing) => {
            // 2 same voices must not form perfect 5th or perfect 8th consecutively
            for (let i = 0; i < voicing.length - 1; i++) {
                for (let j = i + 1; j < voicing.length; j++) {
                    const nextInterval = (voicing[j] - voicing[i]) % 12;
                    if (nextInterval === 7 || nextInterval === 0) {
                        // I asked charGPT for this TS error fix solution
                        const currVoicing = [
                            currChord.bass,
                            currChord.tenor,
                            currChord.alto,
                            currChord.soprano,
                        ].filter((note): note is number => note !== null);

                        const currInterval =
                            (currVoicing[j] - currVoicing[i]) % 12;

                        if (currInterval === 7 && nextInterval === 7) {
                            return false;
                        }
                        if (currInterval === 0 && nextInterval === 0) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        const check = (
            sopranoChoicesArr: number[],
            altoChoicesArr: number[],
            tenorChoicesArr: number[],
            isStrict: boolean
        ) => {
            for (let i = 0; i < sopranoChoicesArr.length; i++) {
                const sopranoNote = sopranoChoicesArr[i];
                for (let j = 0; j < altoChoicesArr.length; j++) {
                    const altoNote = altoChoicesArr[j];
                    for (let k = 0; k < tenorChoicesArr.length; k++) {
                        const tenorNote = tenorChoicesArr[k];

                        const candidateVoicing: Voicing = [
                            bassNote,
                            tenorNote,
                            altoNote,
                            sopranoNote,
                        ];
                        if (
                            noOverlap(candidateVoicing) &&
                            notTooFarApart(candidateVoicing) &&
                            isCompleteTriad(candidateVoicing, isStrict) &&
                            noPerfectParallel(candidateVoicing)
                        ) {
                            return candidateVoicing;
                        }
                    }
                }
            }
        };

        const goodVoicing = check(
            sopranoChoices.good,
            altoChoices.good,
            tenorChoices.good,
            true
        );
        if (goodVoicing) {
            return goodVoicing;
        }

        const okVoicing = check(
            [...sopranoChoices.good, ...sopranoChoices.notVeryGood],
            [...altoChoices.good, ...altoChoices.notVeryGood],
            [...tenorChoices.good, ...tenorChoices.notVeryGood],
            true
        );
        if (okVoicing) {
            return okVoicing;
        }

        const notVeryGoodVoicing = check(
            [...sopranoChoices.good, ...sopranoChoices.notVeryGood],
            [...altoChoices.good, ...altoChoices.notVeryGood],
            [...tenorChoices.good, ...tenorChoices.notVeryGood],
            false
        );
        if (notVeryGoodVoicing) {
            return notVeryGoodVoicing;
        }

        // Array of bad choices can have no values at all in some cases.
        // So this if check is a slight optimization
        if (
            sopranoChoices.bad.length !== 0 ||
            altoChoices.bad.length !== 0 ||
            tenorChoices.bad.length !== 0
        ) {
            const badVoicing = check(
                Object.values(sopranoChoices).flat(),
                Object.values(altoChoices).flat(),
                Object.values(tenorChoices).flat(),
                false
            );
            if (badVoicing) {
                return badVoicing;
            }
        }

        // If bass note is the root, try changing the bass note to the third
        if (nextTriad.indexOf(bassNote) === 0) {
            const newBassNote = findBass([nextTriad[1], nextTriad[1] + 12]);

            // Make sure that findBass() didn't return fallback value, which is root note
            if (nextTriad.indexOf(newBassNote) !== 0) {
                bassNote = newBassNote;
                const notTooBadVoicing = check(
                    [...sopranoChoices.good, ...sopranoChoices.notVeryGood],
                    [...altoChoices.good, ...altoChoices.notVeryGood],
                    [...tenorChoices.good, ...tenorChoices.notVeryGood],
                    false
                );
                if (notTooBadVoicing) {
                    return notTooBadVoicing;
                }
            }
        }

        // fallback
        return findStartingChord();
    };
    //================ (end) VOICING FUNCTION ==================

    const playChord = (rootNote: number) => {
        const nextTriad: Triad = [
            rootNote,
            (rootNote + (chordType === "major" ? 4 : 3)) % 12,
            (rootNote + 7) % 12,
        ];

        const nextVoicing = voicing(nextTriad);

        setCurrChord({
            bass: nextVoicing[0],
            tenor: nextVoicing[1],
            alto: nextVoicing[2],
            soprano: nextVoicing[3],
        });

        if (
            !oscs.bassOsc ||
            !oscs.tenorOsc ||
            !oscs.altoOsc ||
            !oscs.sopranoOsc
        ) {
            // starting chord - create 'new' oscillators
            const bassOsc = actx.createOscillator();
            const tenorOsc = actx.createOscillator();
            const altoOsc = actx.createOscillator();
            const sopranoOsc = actx.createOscillator();

            const bassGain = actx.createGain();
            const tenorGain = actx.createGain();
            const altoGain = actx.createGain();
            const sopranoGain = actx.createGain();

            const oscNodesArr = [bassOsc, tenorOsc, altoOsc, sopranoOsc];
            const gainNodesArr = [bassGain, tenorGain, altoGain, sopranoGain];

            const merger = actx.createChannelMerger(4);
            merger.connect(out);

            for (let i = 0; i < oscNodesArr.length; i++) {
                oscNodesArr[i].frequency.value = findFrequency(nextVoicing[i]);
                oscNodesArr[i].type = soundType;

                if (i == 0) {
                    // bass is slightly louder
                    gainNodesArr[i].gain.value = 0.27;
                } else {
                    gainNodesArr[i].gain.value = 0.22;
                }

                oscNodesArr[i].connect(gainNodesArr[i]);
                gainNodesArr[i].connect(merger, 0, i);
                oscNodesArr[i].start();
            }

            setOscs({
                bassOsc,
                tenorOsc,
                altoOsc,
                sopranoOsc,
            });
        } else {
            // change the pitch of 'existing' oscillators
            oscs.bassOsc.frequency.value = findFrequency(nextVoicing[0]);
            oscs.tenorOsc.frequency.value = findFrequency(nextVoicing[1]);
            oscs.altoOsc.frequency.value = findFrequency(nextVoicing[2]);
            oscs.sopranoOsc.frequency.value = findFrequency(nextVoicing[3]);
        }
    };

    const stopChord = () => {
        oscs.bassOsc?.stop();
        oscs.tenorOsc?.stop();
        oscs.altoOsc?.stop();
        oscs.sopranoOsc?.stop();

        setOscs(initialOscs);
        setCurrChord(initialCurrChord);
    };

    return (
        <SoundContext.Provider
            value={{
                chordType,
                currChord,
                changeChordType,
                changeSoundType,
                playNote,
                playChord,
                stopChord,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}

export { SoundContext, SoundProvider };
