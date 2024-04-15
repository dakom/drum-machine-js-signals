export type Pattern = Array<Array<boolean>>;

export const DrumAndBass: Pattern = [
    // Cymbal
    [
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
    ],
    // HiHat
    [
        false, false, true, false,
        false, false, false, true,
        false, true, false, false,
        true, false, false, false,
    ],
    // Snare
    [
        false, false, false, false,
        true, false, false, false,
        false, false, false, false,
        true, false, false, false,
    ],
    // Bass Drum
    [
        true, false, false, false,
        false, false, false, false,
        false, false, true, false,
        false, false, false, false,
    ],
]