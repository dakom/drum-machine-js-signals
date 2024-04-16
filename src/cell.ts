import { Signal } from 'signal-polyfill';
import style from './cell.module.css'

export class CellId {
    constructor(public readonly row: number, public readonly col: number) {}

    equals(other: CellId): boolean {
        return this.row === other.row && this.col === other.col;
    }
    
    toString(): string {
        return `${this.row},${this.col}`;
    }

    static fromString(s: string): CellId {
        const parts = s.split(',');
        if(parts.length !== 2) {
            throw new Error(`Invalid CellId string: ${s}`);
        }
        return new CellId(parseInt(parts[0]), parseInt(parts[1]));
    }
}

export class Cell {
    public readonly elem:HTMLDivElement;
    active: Signal.State<boolean>;
    lastPhase: CellPhase | undefined;


    constructor(public readonly id: CellId) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.cell);

        this.active = new Signal.State(false);

        this.elem.addEventListener('click', () => {
            this.active.set(!this.active.get());
        });

    }

    phase(currentNote: number) {
        if(!this.active.get()) {
            return CellPhase.Off;
        } else if(this.id.col === currentNote) {
            return CellPhase.Playing;
        } else {
            return CellPhase.Mute;
        }
    }

    render(currentNote: number) {
        const phase = this.phase(currentNote);    

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