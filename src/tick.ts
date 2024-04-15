import {Signal} from 'signal-polyfill';
import { AudioMixer } from './mixer';

export class Ticker {
    public readonly tick: Signal.State<number>;

    constructor(mixer: AudioMixer) {
        this.tick = new Signal.State(mixer.ctx.currentTime);
        const onTick = () => {
            this.tick.set(mixer.ctx.currentTime);
            requestAnimationFrame(onTick);
        }
        requestAnimationFrame(onTick);
    }
}