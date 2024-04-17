import {Signal} from 'signal-polyfill';
import { AudioMixer } from './mixer';
import { PauseButton } from './pause';
import { effect } from './polyfill';

export class Ticker {
    public readonly tick: Signal.State<number>;

    constructor(private mixer: AudioMixer, private pauseButton: PauseButton) {
        this.tick = new Signal.State(mixer.ctx.currentTime);
    }

    component = () => {
        let isPlaying = this.pauseButton.playing.get();
        let lastIsPlaying = isPlaying;
        let pausedAt = 0;
        let accumulatedPause = 0;

        effect(() => {
            isPlaying = this.pauseButton.playing.get();

            if(lastIsPlaying !== isPlaying) {
                if(!isPlaying) {
                    pausedAt = this.mixer.ctx.currentTime;
                } else {
                    accumulatedPause += this.mixer.ctx.currentTime - pausedAt;
                }

                lastIsPlaying = isPlaying;
            }

        })

        const onTick = () => {
            if(isPlaying) {
                this.tick.set(this.mixer.ctx.currentTime - accumulatedPause);
            }

            requestAnimationFrame(onTick);
        }
        requestAnimationFrame(onTick);
    }
}