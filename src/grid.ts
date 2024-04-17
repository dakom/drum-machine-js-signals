import { Signal } from 'signal-polyfill';
import { Cell, CellId, CellPhase } from './cell';
import { CONFIG } from './config';
import style from './grid.module.css'
import { Playhead } from './playhead';
import { AudioId, AudioMixer } from './mixer';
import { Pattern } from './pattern';
import { effect } from './polyfill';

type CellIdKey = string;

export class Grid {
    private cells: Map<CellIdKey, Cell>;
    public readonly elem: HTMLDivElement;
    public readonly currentNote: Signal.Computed<number>;
    // this signal is potentially updated every frame - effects should be careful!
    public readonly playingAudioIds: Signal.Computed<{note: number, ids: AudioId[]}>;
    // patternNotes will not be updated every frame, just when the pattern changes
    public readonly patternNotes: Signal.Computed<boolean[][]>;

    constructor(playhead: Playhead) {

        this.elem = document.createElement('div');
        this.elem.classList.add(style.grid);
 
        this.currentNote = new Signal.Computed(() => {
            return Math.floor(playhead.perc.get() * CONFIG.NOTES); 
        });

        this.cells = new Map();
        for (let row = 0; row < CONFIG.AUDIO.length; row++) {
            const rowElem = document.createElement('div');
            rowElem.classList.add(style.row);
            this.elem.appendChild(rowElem);

            for (let col = 0; col < CONFIG.NOTES; col++) {
                const id = new CellId(row, col);
                const cell = new Cell(id, this.currentNote);
                rowElem.appendChild(cell.elem);
                this.cells.set(id.toString(), cell);
            }
        }

        this.patternNotes = new Signal.Computed(() => {
            const notes = [];

            for (let i = 0; i < CONFIG.AUDIO.length; i++) {
                const row:boolean[] = [];

                for(let j = 0; j < CONFIG.NOTES; j++) {
                    const key = new CellId(i, j).toString();
                    const cell = this.cells.get(key);
                    if(!cell) {
                        throw new Error(`No cell for ${key}`);
                    }

                    row.push(cell.active.get())
                }

                notes.push(row)
            }

            return notes
        });

        this.playingAudioIds = new Signal.Computed(() => {
            const ids = Array.from(this.cells.values())
                .filter(cell => cell.phase() === CellPhase.Playing)
                .map(cell => CONFIG.AUDIO[cell.id.row].id);

            return {note: this.currentNote.get(), ids};
        });
    }

    component = () => {
        this.cells.forEach(cell => cell.render());
    }

    setPattern(pattern: Pattern) {
        this.cells.forEach(cell => {
            if(pattern.notes[cell.id.row][cell.id.col]) {
                cell.active.set(true);
            }
        });
    }
}

export class GridLabels {
    public readonly elem: HTMLDivElement;
    public enabledSignals: Map<AudioId, Signal.State<boolean>> = new Map();
    labelElems: Map<AudioId, HTMLDivElement> = new Map();

    constructor(private mixer: AudioMixer) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.gridLabels);

        CONFIG.AUDIO.forEach(({id, label}) => {
            this.enabledSignals.set(id, new Signal.State(true));
            const labelElem = document.createElement('div');
            labelElem.classList.add(style.label);
            labelElem.innerText = label; 
            labelElem.addEventListener('click', () => {
                const enabledSignal = this.enabledSignals.get(id);
                if(!enabledSignal) {
                    throw new Error(`No enabled signal for ${id}`);
                }
                enabledSignal.set(!enabledSignal.get());
            });
            this.labelElems.set(id, labelElem);
            this.elem.appendChild(labelElem);
        }) 
    }

    component = () => {
        this.enabledSignals.forEach((enabledSignal, id) => {
            const labelElem = this.labelElems.get(id);
            if(!labelElem) {
                throw new Error(`No label element for ${id}`);
            }

            effect(() => {
                const enabled = enabledSignal.get();
                labelElem.classList.toggle(style.labelDisabled, !enabled);

                this.mixer.setTrackVolume(id, enabled ? 1 : 0);
            });
        });
    }
}