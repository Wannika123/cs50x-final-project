// local type
// first number is staring note, second number is ending note
type Range = {
    bass: [number, number];
    tenor: [number, number];
    alto: [number, number];
    soprano: [number, number];
};

// Each note is represented by a number, increase by 1 as the note is semi-tone higher.
// I want the keyboard to start at F2,
// but I also want C to be the number that has no remainder when divided by 12
// So, the array will start at 5 (F2)
export const entireRange: number[] = []; // F2 to E5
for (let i = 5; i <= 40; i++) {
    entireRange.push(i);
}

export const startingRange: Range = {
    bass: [6, 17], // F#2 to F3
    tenor: [18, 22], // F#3 to A#3
    alto: [26, 30], // D4 to F#4
    soprano: [34, 38], // Bb4 to D5
};

// There're some overlapping
export const range: Range = {
    bass: [5, 21], // F2 to A3
    tenor: [17, 26], // F3 to D4
    alto: [23, 33], // B3 to A4
    soprano: [31, 40], // G4 to E5
};

// This function will check if the note is within the range
export const isWithinRange = (note: number, range: [number, number]) => {
    if (note >= range[0] && note <= range[1]) {
        return true;
    }
    return false;
};
