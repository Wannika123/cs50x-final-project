# Circle of Fifth

This is CS50x final project by Wannika Kuankachorn.

## Table of contents

-   [Overview](#overview)
    -   [Links](#links)
    -   [Description](#description)
-   [Built with](#built-with)
-   [Inside `src/` folder](#inside-src-folder)
    -   [`global/` and `type/` folder](#global-and-type-folder)
    -   [`context/` folder](#context-folder)
        -   [States](#states)
        -   [Functions](#functions)
        -   [Voicing Function](#voicing-function)
    -   [`components/` folder](#components-folder)
-   [Inspirations](#inspirations)

## Overview

### Links

Video Demo: [Youtube](https://youtu.be/6IMRySl7ZEk)
Preview Site: [Vercel](https://cs50x-final-project.vercel.app/)

### Description

Circle of Fifth is the thing in western music theory. At its very basic, it's just how you can spread out all 12 notes in western music: by counting up perfect fifth interval, as the name implies. But with such simplicity, there're many interesting things about it. And this project lets you explore and play with the sound however you want, at your own speed.

## Built with

-   React
-   TypeScript
-   Vite
-   Web Audio API

## Inside `src/` folder

![src/ folder](/README_assets/src%20folder.png)

### `global/` and `type/` folder

These 2 folders exist mainly because I don't want React context file to be too messy. But there's one thing I would like to point out:

Each note on the piano keyboard will be represented by the number, increase by 1 as the note is semi-tone higher (a key higher). And I store all those notes (numbers) in an array, which is in `range.ts` file, in `global/` folder:

```
export const entireRange: number[] = []; // F2 to E5
for (let i = 5; i <= 40; i++) {
    entireRange.push(i);
}
```

The reason I start with 5 (instead of 0) is that I want the note C (or _Do_) to be the number that when divided by 12, there's no remainder. As the keyboard will start with note F, it has to be 5.

### `context/` folder

![context folder](/README_assets/context%20folder.png)

Almost at the top of `SoundContext.tsx` file, right after all the imports, I initialized audio context and audio destination:

```
const actx = new AudioContext();
const out = actx.destination;
```

#### States

```
const [chordType, setChordType] = useState<ChordType>("major");
const [soundType, setSoundType] = useState<OscillatorType>("triangle");
const [currChord, setCurrChord] = useState<CurrChord>({
    bass: null,
    tenor: null,
    alto: null,
    soprano: null,
});
const [oscs, setOscs] = useState<Oscs>({
    bassOsc: null,
    tenorOsc: null,
    altoOsc: null,
    sopranoOsc: null,
});
```

-   `chordType` is for storing chord type (surprisingly). The value can be either `'major'` or `'minor'`.

-   `soundType` is for storing sound type. The value can be `'sine'`, `'triangle'`, `'square'` or `'sawtooth'`. These are the Web Audio API's basic sound type that come out of the box.

-   `'currChord'` is for storing the numbers that represent the note in each voice. (When it's not playing, all the values are `null`)

-   `'oscs'` is for storing Web Audio API's Oscillator Nodes for each voice. (When it's not playing, all the values are `null`)

> [!NOTE]
> This kind of 4-part voicing is called 'chorale-style voice leading'.

#### Functions

-   `changeChordType()` and `changeSoundType()` are simple functions for changing chord type and sound type.

-   `playNote()` is the function that will play the sound of the note that is passed in (as a number). This function is for the piano keyboard.

-   `voicing()` is a pretty big function. And it's the heart of the entire algorithm. It will return the notes (as a number) for each voice, as an array. (Much more about this function later)

-   `playChord()` will grab the returned value from `voicing()` function, and do the Web Audio API stuff to make it sound.

```
const playChord = (rootNote: number) => {
    // Find 'nextTriad'

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
        // This means it's the starting chord. So, create 'new' oscillators.
    } else {
        // NOT the starting chord. So, change the pitch of 'existing' oscillators
    }
};
```

-   `stopChord()` is the function that will stop all the sound.

#### Voicing Function

This function has 1 parameter: `nextTriad`, which is an array of 3 numbers.

```
const voicing = (nextTriad) => { ... }
```

<ins>What's triad?</ins>

In its fundamental form, triad looks like this:

![triad](/README_assets/triad.jpg)

You may think of it as fishballs:

![fishball](/README_assets/fishball.jpeg)

Or for more official explanation: In music, a triad is a set of three notes that can be stacked vertically in thirds. Triads are the most common chords in Western music. (Source: [wikipedia](<https://en.wikipedia.org/wiki/Triad_(music)>))

The notes that construct triad, from lowest-pitched tone to highest, are called:

-   the _root_ - or bottom fishball
-   the _third_ - or middle fishball
-   the _fifth_ - or top fishball

And the _root_ will become the part of the chord name. For example, _C major_ or _C minor_ triad will have _C_ as a root note.

And it's the array of these 3 notes that's going to be passed into the voicing function. (Root at index 0, third at index 1, fifth at index 2)

The only different between major triad and minor triad is the _third_ (middle fishball). You can see from how I find the triad array before passing it into the voicing function:

```
const nextTriad = [
    rootNote,
    (rootNote + (chordType === "major" ? 4 : 3)) % 12,
    (rootNote + 7) % 12,
];
```

> [!TIP]
> For a more musical explanation: for minor triad, the third is minor third interval (3 semitones) from the root note. For major triad, the third is major third interval (4 semitones) from the root note. While the fifth of both major and minor triad is the perfect fifth interval (7 semitones) from the root.

Of course that in real situation, when selecting the note for each voice, it doesn't have to be close together, and notes can flip around. The top voice (soprano) doesn't have to be the _fifth_, though it's preferable if the lowest voice (bass) is the _root_, but it can also be the _third_ (it shouldn't be the _fifth_). Triad in its fundamental (fishballs) form is just like the reference for what note are there in the chord.

> [!TIP]
> The reason why bass note should not be the _fifth_ is that the _fifth_ is powerful, and it can claim itself to be the _root_. For example, in C major chord, if the bass voice is _G_ (the _fifth_), all the upper voices will feel more like the tension waiting to be resolved into G major chord.

_There are 2 possible ways how the returned value is calculated._

1. When it's the starting chord.
2. When it's NOT the starting chord.

**When it's the starting chord**, I want the chord to have _open_ spacing like this:

![open spacing](/README_assets/open%20spacing.png)

compared with _close_ spacing:

![close spacing](/README_assets/close%20spacing.png)

You may feel that with open spacing, each voice (especially 3 upper voices) has more room, it can go up or down, more possibility and flexibility. And that's the exact reason I choose open spacing for the starting chord; it's more likely to last longer before it reaches the deadend and need to use fallback solution.

How to find this open spacing is not much more difficult than how to find the triad array. Because if the distance between notes are fixed when it's in fundamental triad (fishball) form, when the notes flip around, it's fixed too!

For example, in major triad, the _third_ is 4 semitones higher (4 keys higher) from the _root_. If the _root_ is flipped above the _third_, then that flipped _root_ note is 8 semitones higher than the _third_ etc.

This is a mini function inside voicing function itself, specifically used for calculating the starting chord. By passing in the note of certain voice, it will first find what that note is in the triad (_root_, _third_ or _fifth_), and since we know the exact distance between notes in the triad, we can easily find the note in the upper voice that allow the chord to have open spacing.

```
const findUpperVoice = (lowerVoice: number) => {
    const triadIndex = nextTriad.indexOf(lowerVoice % 12);

    return (
        lowerVoice +
        (triadIndex === 0 ? 7 : 0) +
        (triadIndex === 1 ? (chordType === "major" ? 8 : 9) : 0) +
        (triadIndex === 2 ? (chordType === "major" ? 9 : 8) : 0)
    );
};
```

(So, this is more like a brute force than the clever algorithm.)

And it can be used in this way:

```
const startingAlto = findUpperVoice(startingTenor);
const startingSoprano = findUpperVoice(startingAlto);
```

The nice thing is that with this calculation, the 3 upper voices will have all the triad notes (one voice will be the _root_, one voice will be the _third_, and one voice will be the _fifth_). And as I mentioned earlier that it's preferable that the bass (lowest voice) be the _root_, so the bass will be the _root_ for the starting chord. Thus, we will end up with 2 _root_ notes, 1 _third_, and 1 _fifth_. And that's the preferable note choice as well for triad chord in 4-part voicing.

One more thing I need to make sure is that the chord is in middle range, not too high or not too low. Otherwise it doesn't really have much flexibility.

For example, these 2 chords have open spacing, but it's either too high or too low:

![high and low (open spacing)](</README_assets/high%20and%20low%20(open%20spacing).png>)

So I assign _range_ for each voice. And only the notes that fall within the range are qualified. The range is implemented in `range.ts` file (in `global/` folder):

```
export const startingRange = {
    bass: [6, 17],
    tenor: [18, 22],
    alto: [26, 30],
    soprano: [34, 38],
};
```

Unlike `entireRange`, these arrays only contain lowerbound and upperbound. And you may notice that the ranges of 3 upper voices (_tenor_, _alto_ and _soprano_) are quite limited. And it's actually very limited that each chord only have 1 possibility for such open spacing.

> [!NOTE]
> There's a function that check if the note is within the range, and that function is also implemented in `range.ts` file.

It's actually not too bad if every chord is fixed in this way. But other than the fact that it's going to be a bit boring, something called _perfect parallel_ is very likely to happen. And that's something music theory teacher is not going to tolerate; and we, students, have no hope to get any point out of that chord after committing such a crime.

So I'll be a good student and do the best I can. I can't say, though, that every chord will be a good voicing. In the best scenerio, music arranger should also know where the chord is leading to, so that there will be some preparation for that as well. Anyway, I can say that most of the chords are not bad, so it's still going to be a good voicing overall.

The overview of how all the subsequent chords are calculated is that each voice will have an array of note choices. And those arrays will be passed into a kind of test function, and it will return the note in the array that is in accord with the voicing principles in music theory. And you may find that those principles are simpler than you think.

Like most music arrangers (if not all), I will determine the bass note first, it's like the foundation on which all other voices are built. Then I will determine all 3 upper voices simultaneously. But before I elaborate more in detail, I would like to present the ranges:

```
export const range = {
    bass: [5, 21],
    tenor: [17, 26],
    alto: [23, 33],
    soprano: [31, 40],
};
```

Of course that it's different from the starting chord range. It's much wider. There're also some overlapping between voices, and this will allow the chord to have close spacing if it needs to.

Now the note choices for bass voice is quite straightforword:

```
const bassChoices = [
    nextTriad[0],
    nextTriad[0] + 12,
    nextTriad[1],
    nextTriad[1] + 12,
];
```

First 2 values are root note (different octave), last 2 values are 3rd note (different octave). Note that the order matters. What comes first is more preferable choices, it will be checked first. And if it's ok, it will be returned right away.

And `findBass()` is the function that will find the appropriate note in the array. And it will check something like:

-   Bass note is within the range.
-   Bass note doesn't jump too far from the current bass note.
-   Bass note doesn't jump in tritone interval from the current bass note.

> [!TIP]
> Tritone, aka _devil interval_, is the interval that is 6 semitones apart. In ancient time, it's strictly prohibited. But it's used much more often nowadays.

> [!IMPORTANT]
> Just to remind that the notes of current chord can be accessed right away, as it is stored in `currChord` state.

The function for checking 3 upper voices I simply name it `check()`, and here it is:

```
const check = (
    sopranoChoices: number[],
    altoChoices: number[],
    tenorChoices: number[],
    isStrict: boolean
) => { ... }
```

The function will try all the possible combinations of 3 upper voices. The bass note that is chosen earlier will come into consideration as well. And here are things this function will check:

1.  There's no overlap. Though the ranges for each voice has some overlapping, but bass must NOT be higher than tenor, so on and so forth.

2.  The distance between soprano and alto (or between alto and tenor) must NOT be more than an octave (or 12 semitones apart).

3.  As I said earlier that the preferable note choices for triad chord in 4-part voicing is to double _root_ (2 _root_ notes, 1 _third_ and 1 _fifth_). The `check()` function will check for this as well.

But you may notice that there's `isStrict` parameter. And if the value is `false`, the note choices can also double _third_ or double _fifth_, and it can also be 3 _root_ notes and 1 _third_.

4. Here comes the main reason for all these troubles: _perfect parallel_. And here are some examples:

![perfect parallels](/README_assets/perfect%20parallels.png)

It's when any 2 same voices (whether between bass and soprano, or tenor and alto, or any voices), form perfect fifth or perfect eighth (octave) consecutively. And you may see how this can easily happen if we are not careful; there are perfect fifth everywhere in major and minor chord!

> [!TIP]
> Perfect consonances (like 5th or 8th) is the interval that make 2 voices (that form that interval) sound so blended together, as though it's just 1 voice. So, having _perfect parallel_ will make the chord as a whole sound more hollow, as though one voice has disappeared.

How to find note choices for the 3 upper voices are a bit more complicated than bass note choices. I implement a function `findChoices()` for this purpose, and this function will return an object like this:

```
{
    good: [...(good note choices) ...],
    notVeryGood: [...(not-very-good note choices) ...],
    bad: [...(bad note choices) ...],
}
```

What is considered _good choices_ are just the notes that don't jump far from the current note. _Not-very-good choices_ are notes that are just further, and _bad choices_ even further.

In this situation where there's no melody to be considered, we just have to try to minimize the movement of 3 upper voices to ensure the smoothness, whereas the bass voice is the only part that will have more movement.

And these choices will be passed into `check()` function in this way:

```
const goodVoicing = check(
    sopranoChoices.good,
    altoChoices.good,
    tenorChoices.good,
    true
);
if (goodVoicing) {
    return goodVoicing;
}
```

First, I will pass only the good choices. And if there's the returned value from `check()`, I will return it from the voicing function immediately. But if there isn't, then I will pass more choices:

```
const okVoicing = check(
    [...sopranoChoices.good, ...sopranoChoices.notVeryGood],
    [...altoChoices.good, ...altoChoices.notVeryGood],
    [...tenorChoices.good, ...tenorChoices.notVeryGood],
    true
);
```

If there's still no returned value, then more choices. And the value of the last parameter (`isStrict`) will start to be `false`.

One final attempt is to try changing the bass note. But this only apply when bass note is the _root_, which will be changed to the _third_. (If it's already the _third_, then go staight to the fallback.)

```
if (nextTriad.indexOf(bassNote) === 0) {
    const newBassNote = findBass([nextTriad[1], nextTriad[1] + 12]);

    // Call check() function one last time
}
```

If still `check()` can't see no way out, then there's a fallback, and that's just a starting chord. Here is the last line of the voicing function:

```
return findStartingChord();
```

I let the chords play randomly 50 times, and record what quality (_good_, or _ok_, or _bad_ etc.) of voicing those chords are. Here are the results:

First try:

-   _good_ voicing - 21 times
-   _ok_ voicing - 17 times
-   _not very good_ voicing - 4 times
-   _not too bad_ voicing - 2 times
-   _bad_ voicing - 1 time
-   fallback - 4 times

Second try:

-   _good_ voicing - 19 times
-   _ok_ voicing - 20 times
-   _not very good_ voicing - 4 times
-   _not too bad_ voicing - 2 times
-   _bad_ voicing - 0 time
-   fallback - 4 times

Third try:

-   _good_ voicing - 25 times
-   _ok_ voicing - 16 times
-   _not very good_ voicing - 4 times
-   _not too bad_ voicing - 1 times
-   _bad_ voicing - 0 time
-   fallback - 3 times

> [!IMPORTANT]
> These consideration (_good_, _bad_ etc.) are just how I name the variables. Please don't take its meaning too seriously. And having what is considered _bad_ voicing is not necessarily going to make the song bad. A piece of music should be judged as a whole. And also, real cool music often break rules in music theory.

> [!NOTE]
> When playing the chords along circle of fifth, either clockwise or anti-clockwise direction. It can only be either _good_ or _ok_ voicing.

### `components/` folder

![components](/README_assets/component.png)

<ins>**`Keyboard` component**</ins>

The challenge of this component is HTML and CSS. And this is how it's implemented:

```
{entireRange.map((note) => {
    if (isWhiteKey(note)) {
        return (
            <div className={styles["key-container"]} key={note}>
                <div className={styles["white-key"]}>
                    {/* key label  */}
                </div>

                {(note % 12 !== 4 && note % 12 !== 11) && (
                    <div className={styles["black-key"]}>
                        {/* key label  */}
                    </div>
                )}
            </div>
        );
    }
})}
```

For positioning, I have to nest white key and black key that _immediately_ follow in a parent `<div>`. I have `isWhiteKey()` function to check if it's white key. But some white key doesn't have the following black key (_E_ and _B_), so I have to check that too.

In CSS:

```
.key-container {
    display: inline-block;
    position: relative;
    width: 40px;
    height: 150px;
}
.white-key {
    position: relative;
    width: 100%;
    height: 100%;
    /* other stuff */
}
.black-key {
    width: 70%;
    height: 60%;
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    translate: 50%;
    /* other stuff */
}
```

I also make the piano keyboard accessible; users can use _arrow_ key to navigate, and use _space_ or _enter_ to play the note:

```
useEffect(() => {
    const handler = (e: KeyboardEvent) => {
        if (e.target !== containerRef.current) return;

        switch (e.code) {
            case "ArrowUp":
            case "ArrowRight":
            case "ArrowDown":
            case "ArrowLeft":
                // navigate the piano keyboard
                break;
            case "Enter":
            case "Space":
                // play piano keyboard
                break;
        }
    };
    containerRef.current?.addEventListener("keydown", handler);

    return () => {
        containerRef.current?.removeEventListener("keydown", handler);
    };
}, [focusIndex]);
```

> [!NOTE]
> Accessibility is also implemented in `Select` and `Circle` component.

<ins>**`SelectsContainer` component**</ins>

Inside this component, some `Select` components are rendered.

`Select` component is the template that is reusable. You only have to pass the default value, all the options, as well as the function that change the option value. For example:

```
<Select
    kind="chord"
    value={chordTypeVal}
    options={chordTypeOptions}
    onChange={onChordTypeChange}
/>
```

> [!NOTE]
> The reason for having `kind` property is about TypeScript. It helps TS infer the type of `onChange`. (I ask chatGPT for this)

<ins>**`CircleAndBtnsWrapper` component**</ins>

The reason why `Circle` and `Buttons` component have to be nested in a parent component is that they need to share some states.

`Circle` needs to know whether the sound is being played automatically, so that in that case, the mouse will be unable to interact with the `Circle`. And `Buttons` needs to be able to get access to the state that track which chord is playing, so that it can trigger the style changes.

And in `Circle` component, how I arrange all the chord symbols in circle like a clock is by using `rotate()` CSS:

```
{findCircleArr(chordType).map((obj, i) => (
    {/* These containers are stacked together with 'position: absolute' */}
    <div
        className={`${styles["chord-container"]}`}
        style={{ transform: `rotate(${30 * i}deg)` }}
        key={`chord: ${obj.chordSymbol}`}
    >
        {/* rotate the alphabet itself back to normal */}
        <div style={{ transform: `rotate(${-30 * i}deg)` }}>
            {/* chord symbol */}
        </div>
    </div>
))}
```

> [!NOTE] > `findCircleArr()` returns an array of 12 objects. Each object has `chordSymbol` property, for rendering visually; and `rootNote` property, this is the value to be passed into the function when it's clicked.

And how the sound can be played automatically is by using `setInterval`.

In `Buttons` component:

```
useEffect(() => {
    if (playMode === null) return;

    const chordSequence = setInterval(() => {
        // find root note

        setActiveChord(rootNote);
        playChord(rootNote);
    }, (seconds ? seconds : 0.1) * 1000);

    return () => clearInterval(chordSequence);
}, [playMode, activeChord]);
```

## Inspirations

1. Web Audio API is the tool that appeal to me from the very first. It's the tool that I want to be good at. And as I was thinking what my final project should be, I just wanted to somehow use Web Audio API.

2. Ever since I started learning how to code, which is the subject that probably has the best resources online, I have encountered many _interactive_ lessons and examples. And in my opinion, it works so well for certain contents. And it makes me think that it would be nice if there are something like that in other subjects as well.

3. Music is difficult, but it's even more difficult when we try to talk about it. And whenever we do, it can potentially sound super complicated. And I think the main reason is because of all the weird vocabularies like triad, inversion, cadence, major, minor etc., which are just necessary (and unavoidable) when we try to refer to certain note or something, but they are not essential at all.

So, this project is the result of all these. It's my attempt, as many others has attempted before, to clarify Circle of Fifth. It invites users to forget all the weird vocabularies (you can even forget what perfect fifth is), and focus on the essential, which is how it sounds like.

When this idea first came up in my mind, I actually felt pretty daunted. But now I'm very happy that I can really finish it. And I really hope that it works.

Thank you for reading!
