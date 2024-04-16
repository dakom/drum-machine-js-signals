import { Pattern } from "./pattern"

export const CONFIG = {
    SPEED: {
        min: 1.0,
        max: 20.0,
    },
    VOLUME: {
        min: 0.0,
        max: 1.0,
    },
    NOTES: 16,
    AUDIO: [
        {
            file: "cymbal.wav",
            label: "CY",
            id: "Cymbal",
        },
        {
            file: "hihat.wav",
            label: "HH",
            id: "HiHat",
        },
        {
            file: "snare.wav",
            label: "SD",
            id: "Snare",
        },
        {
            file: "bass.wav",
            label: "BD",
            id: "BassDrum",
        },
    ],
    DEBUG_AUTO_START: import.meta.env.DEV ? true : false,
    INITIAL_PATTERN: DrumAndBass()
}


function DrumAndBass():Pattern {
    return {
        notes: [
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
        ],
        speed: 12.0,
        volume: 0.5
    }
}