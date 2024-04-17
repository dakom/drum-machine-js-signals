import { Signal } from 'signal-polyfill';
import { CONFIG } from './config';
import style from './playhead.module.css';
import { Ticker } from './tick';
import { Sliders } from './sliders';
import { effect } from './polyfill';

export class Playhead {
    public readonly elem: HTMLDivElement;
    public readonly perc: Signal.Computed<number>;
    arrowElem: HTMLDivElement;

    constructor(ticker: Ticker, sliders: Sliders) {
        this.elem= document.createElement('div');
        this.elem.classList.add(style.bg);

        this.arrowElem = document.createElement('div');
        this.arrowElem.classList.add(style.arrowContainer);
        const innerElem = document.createElement('div');
        innerElem.classList.add(style.arrow);
        this.arrowElem.appendChild(innerElem);
        this.elem.appendChild(this.arrowElem);

        this.perc = new Signal.Computed(() => {
            // get the note with the remainder, no flooring
            const note = (ticker.tick.get() * sliders.speed().get()) % CONFIG.NOTES;
            return (note / CONFIG.NOTES);
        })
    }

    component = () => {
        effect(() => {
            // cellWidth is 5.5, cell spacing is 1, so it's 6.5 per cell
            // however, the playhead is positioned from bottom-left corner
            // so it's actually the width of one less cell
            const fullWidth = 6.5 * (CONFIG.NOTES-1);
            const x = this.perc.get() * fullWidth;

            this.arrowElem.style.left = `${x}rem`;
        });
    }
}