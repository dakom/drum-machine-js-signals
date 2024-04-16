// This is just a way to load/save predefined patterns
// uses the URL for "storage" and sharing
import { CONFIG } from "./config";

export interface Pattern {
    notes: Array<Array<boolean>>,
    speed: number,
    volume: number,
}

export function setPatternUrl(pattern: Pattern) {
    console.log(pattern);
    const url = new URL(window.location.href);
    url.searchParams.set('pattern', serialize(pattern));
    window.history.replaceState({}, '', url.toString());
}

export function getPatternUrl(): Pattern | null {
    const url = new URL(window.location.href);
    const patternString = url.searchParams.get('pattern');
    if(!patternString) {
        return null;
    }
    try {
        const pattern = deserialize(patternString);
        return pattern
    } catch(e) {
        console.error(e);
        return null;
    }
}

function serialize(pattern: Pattern): string {
    assertValid(pattern);

    let output = `${pattern.speed}-${pattern.volume}`; 

    for(let i = 0; i < CONFIG.AUDIO.length; i++) {
        let audioRow = 0;
        for(let j = 0; j < CONFIG.NOTES; j++) {
            if(pattern.notes[i][j]) {
                audioRow |= 1 << j;
            }
        }
        output += `-${audioRow}`;
    }

    return output
}

function deserialize(s: string): Pattern {
    const parts = s.split('-');

    if(parts.length !== 2 + CONFIG.AUDIO.length) {
        throw new Error(`Invalid number of parts: ${parts.length}`);
    }

    const speed = parseFloat(parts[0]);
    const volume = parseFloat(parts[1]);

    const notes = [];
    for(let i = 0; i < CONFIG.AUDIO.length; i++) {
        const audioRow = parseInt(parts[i + 2]);
        const row = [];
        for(let j = 0; j < CONFIG.NOTES; j++) {
            row.push((audioRow & (1 << j)) !== 0);
        }
        notes.push(row);
    }

    const pattern = { notes, speed, volume };
    assertValid(pattern);
    return pattern;
}

function assertValid(pattern: Pattern) {

    for(const row of pattern.notes) {
        if(row.length !== CONFIG.NOTES) {
            throw new Error(`Invalid note/column length: ${row.length} !== ${CONFIG.NOTES}`);
        }
    }

    if(CONFIG.NOTES > 32) { 
        throw new Error(`patterns can only be up to 32 notes long`);
    }

    if(pattern.notes.length !== CONFIG.AUDIO.length) {
        throw new Error(`Invalid audio/row length: ${pattern.notes.length} !== ${CONFIG.AUDIO.length}`);
    }

    if(pattern.speed < CONFIG.SPEED.min || pattern.speed > CONFIG.SPEED.max) {
        throw new Error(`Invalid speed: ${pattern.speed}`);
    }

    if(pattern.volume < CONFIG.VOLUME.min || pattern.volume > CONFIG.VOLUME.max) {
        throw new Error(`Invalid volume: ${pattern.volume}`);
    }

}