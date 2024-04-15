import { DrumAndBass } from "./pattern";

export const CONFIG = {
    SPEED: {
        min: 1.0,
        max: 20.0,
        value: 12.0,
    },
    VOLUME: {
        min: 0.0,
        max: 1.0,
        value: 0.5,
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
    DEBUG_AUTO_START: import.meta.env.DEV ? false : false,
    INITIAL_PATTERN: DrumAndBass
}