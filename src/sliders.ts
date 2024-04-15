import { Signal } from 'signal-polyfill';
import style from './sliders.module.css';
import { CONFIG } from './config';

export class Sliders {
    public readonly elem: HTMLDivElement;
    private speedSlider:Slider;
    private volumeSlider:Slider;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.sliders);

        this.speedSlider = new Slider('Speed', CONFIG.SPEED);
        this.volumeSlider = new Slider('Volume', CONFIG.VOLUME);

        this.elem.appendChild(this.speedSlider.elem);
        this.elem.appendChild(this.volumeSlider.elem);

    }

    speed(): Signal.State<number> {
        return this.speedSlider.value
    }

    volume(): Signal.State<number> {
        return this.volumeSlider.value
    }
}
export class Slider {
    public readonly elem: HTMLDivElement;
    public readonly value: Signal.State<number>;

    constructor(label: string, {min, max, value}: SliderConfig) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.slider);

        const labelElem = document.createElement('div');
        labelElem.classList.add(style.label);
        labelElem.innerText = label;
        this.elem.appendChild(labelElem);

        const rangeElem = document.createElement('input');
        rangeElem.classList.add(style.input);
        rangeElem.type = 'range';
        rangeElem.min = min.toString(); 
        rangeElem.max = max.toString();
        rangeElem.step = '0.01';
        rangeElem.value = value.toString();
        this.elem.appendChild(rangeElem);

        this.value = new Signal.State(value);

        rangeElem.addEventListener('input', () => {
            let curr = parseFloat(rangeElem.value);
            this.value.set(curr)
        })
    }
}

interface SliderConfig {
    min: number,
    max: number,
    value: number,
}