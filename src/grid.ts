import { Signal } from 'signal-polyfill';
import { Cell, CellId, CellPhase } from './cell';
import { CONFIG } from './config';
import style from './grid.module.css'
import { Playhead } from './playhead';
import { AudioId } from './mixer';
import { Pattern } from './pattern';

export class Grid {
    public readonly cells: Map<CellId, Cell>;
    public readonly elem: HTMLDivElement;
    public readonly currentNote: Signal.Computed<number>;
    public readonly playingAudioIds: Signal.Computed<{note: number, ids: AudioId[]}>;
    private lastNote: number = -1;

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
                const id = { col, row };
                const cell = new Cell(id, this.currentNote);
                rowElem.appendChild(cell.elem);
                this.cells.set(id, cell);
            }
        }

        this.playingAudioIds = new Signal.Computed(() => {
            const ids = Array.from(this.cells.values())
                .filter(cell => cell.phase.get() === CellPhase.Playing)
                .map(cell => CONFIG.AUDIO[cell.id.row].id);

            return {note: this.currentNote.get(), ids};
        });
    }

    render() {
        const note = this.currentNote.get();
        if(note === this.lastNote) {
            return;
        }
        this.cells.forEach(cell => cell.render());
        this.lastNote = note;
    }

    setPattern(pattern: Pattern) {
        this.cells.forEach(cell => {
            const {row, col} = cell.id;
            if(pattern[row][col]) {
                cell.active.set(true);
            }
        });
    }
}

export class GridLabels {
    public readonly elem: HTMLDivElement;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.gridLabels);

        CONFIG.AUDIO.forEach(({label}) => {
            const labelElem = document.createElement('div');
            labelElem.classList.add(style.label);
            labelElem.innerText = label; 
            this.elem.appendChild(labelElem);
        }) 
    }
}