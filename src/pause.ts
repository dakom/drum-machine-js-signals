import { Signal } from 'signal-polyfill';
import style from './pause.module.css';
export class PauseButton {
    public readonly elem: HTMLDivElement;
    public readonly playing: Signal.State<boolean>;
    private imgElem: HTMLDivElement;
    private hover: Signal.State<boolean>;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.container);
        this.imgElem = document.createElement('div');
        this.elem.appendChild(this.imgElem);

        this.playing = new Signal.State(true);
        this.hover = new Signal.State(false);

        this.elem.addEventListener('mouseenter', () => {
            this.hover.set(true);
        });

        this.elem.addEventListener('mouseleave', () => {
            this.hover.set(false);
        });

        this.elem.addEventListener('click', () => {
            this.playing.set(!this.playing.get());
        });

        let beforeVisibilityState = this.playing.get();

        document.addEventListener("visibilitychange", () => {
            if(document.hidden) {
                beforeVisibilityState = this.playing.get();
                this.playing.set(false);
            } else {
                this.playing.set(beforeVisibilityState);
            }
        });

    }

    render() {
        if(this.playing.get()) {
            this.imgElem.innerHTML = pauseButtonSvg({
                colorClass: this.hover.get() ? style.colorHover : style.color
            });
        } else {
            this.imgElem.innerHTML = playButtonSvg({
                colorClass: this.hover.get() ? style.colorHover : style.color
            });
        }
    }
}

const pauseButtonSvg = ({colorClass}:{colorClass: string}) => `
<?xml version="1.0" encoding="utf-8"?>
<svg width="5rem" height="5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path class="${colorClass}" d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" stroke-width="2"/>
<path class="${colorClass}" d="M10 10L10 14M14 10V14" stroke-width="2" stroke-linecap="round"/>
</svg>
`

const playButtonSvg = ({colorClass}:{colorClass: string}) => `
<?xml version="1.0" encoding="utf-8"?>
<svg width="5rem" height="5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path class="${colorClass}" d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" stroke-width="2"/>
<path class="${colorClass}" d="m9 7l7 5-7 5z" stroke-width="2" stroke-linejoin="round"/>
</svg>
`