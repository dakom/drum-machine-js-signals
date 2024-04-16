import { Signal } from 'signal-polyfill';
import style from './sliders.module.css';
import { CONFIG } from './config';
import { Pattern } from './pattern';

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

    setPattern(pattern: Pattern) {
        this.speedSlider.setValue(pattern.speed);
        this.volumeSlider.setValue(pattern.volume);
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
    private rangeElem: HTMLInputElement;

    constructor(label: string, {min, max}: SliderConfig) {
        const mid = (min + max) / 2; // just used to set a sane initial value, overrided by pattern
        
        this.elem = document.createElement('div');
        this.elem.classList.add(style.slider);

        const labelElem = document.createElement('div');
        labelElem.classList.add(style.label);
        labelElem.innerText = label;
        this.elem.appendChild(labelElem);

        this.rangeElem = document.createElement('input');
        this.rangeElem.classList.add(style.input);
        this.rangeElem.type = 'range';
        this.rangeElem.min = min.toString(); 
        this.rangeElem.max = max.toString();
        this.rangeElem.step = '0.01';
        this.rangeElem.value = mid.toString(); 
        this.elem.appendChild(this.rangeElem);

        this.value = new Signal.State(mid);

        this.rangeElem.addEventListener('input', () => {
            let curr = parseFloat(this.rangeElem.value);
            this.value.set(curr)
        })
    }

    setValue(val: number) {
        this.value.set(val);
        this.rangeElem.value = val.toString();
    }
}

interface SliderConfig {
    min: number,
    max: number,
}