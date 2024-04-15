import { Signal } from 'signal-polyfill';
import style from './cell.module.css'

export type CellId = { col: number; row: number; }

export class Cell {
    public readonly elem:HTMLDivElement;
    active: Signal.State<boolean>;
    phase: Signal.Computed<CellPhase>;
    lastPhase: CellPhase | undefined;


    constructor(public readonly id: CellId, currentNote: Signal.Computed<number>) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.cell);

        this.active = new Signal.State(false);

        this.elem.addEventListener('click', () => {
            this.active.set(!this.active.get());
        });

        this.phase = new Signal.Computed(() => {
            if (!this.active.get()) {
                return CellPhase.Off;
            } else if (this.id.col === currentNote.get()) {
                return CellPhase.Playing;
            } else {
                return CellPhase.Mute;
            }
        });

    }

    render() {
        const phase = this.phase.get();

        if(phase === this.lastPhase) {
            return;
        }

        this.lastPhase = phase;

        this.elem.classList.remove(style.phaseOff, style.phaseMute, style.phasePlaying);
        switch (phase) {
            case CellPhase.Off:
                this.elem.classList.add(style.phaseOff);
                break;
            case CellPhase.Mute:
                this.elem.classList.add(style.phaseMute);
                break;
            case CellPhase.Playing:
                this.elem.classList.add(style.phasePlaying);
                break;
        }
    }
}

export enum CellPhase {
    Off,
    Mute,
    Playing,
}