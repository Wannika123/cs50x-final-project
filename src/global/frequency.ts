// A4 = 442Hz tuning (These are the frequency of the 'lowest' octave of this project's keyboard)
const frequencyArr = [
    65.704, // C2
    69.611, // Db2
    73.75,
    78.135,
    82.781,
    87.704,
    92.919,
    98.444,
    104.298,
    110.5,
    117.071,
    124.032, // B2
];

// Find frequency of the note that's passed in. (This is for Web Audio API)
// (The note that is 1 octave higher will have 2x frequency)
export const findFrequency = (note: number) => {
    const exponent = Math.floor(note / 12);

    return frequencyArr[note % 12] * Math.pow(2, exponent);
};
