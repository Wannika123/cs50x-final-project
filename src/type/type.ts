export type ChordType = "major" | "minor";

export type CurrChord = {
    bass: null | number;
    tenor: null | number;
    alto: null | number;
    soprano: null | number;
};

export type Oscs = {
    bassOsc: null | OscillatorNode;
    tenorOsc: null | OscillatorNode;
    altoOsc: null | OscillatorNode;
    sopranoOsc: null | OscillatorNode;
};

// index 0 is the root note, index 1 is the third note, index 2 is the 5th note
// (Note that when musicians call second note, third note etc., they mean 'a single note'.
// Third note means the note that is major 3rd or minor 3rd from the root, depending on context.)
export type Triad = [number, number, number];

export type Voicing = [number, number, number, number];

export type Choices = {
    good: number[];
    notVeryGood: number[];
    bad: number[];
};
