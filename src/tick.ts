import {Signal} from 'signal-polyfill';
import { AudioMixer } from './mixer';
import { PauseButton } from './pause';

export class Ticker {
    public readonly tick: Signal.State<number>;

    constructor(mixer: AudioMixer, pauseButton: PauseButton) {
        this.tick = new Signal.State(mixer.ctx.currentTime);
        let lastIsPlaying = pauseButton.playing.get();
        let pausedAt = 0;
        let accumulatedPause = 0;
        const onTick = () => {
            const isPlaying = pauseButton.playing.get();

            if(lastIsPlaying !== isPlaying) {
                if(!isPlaying) {
                    pausedAt = mixer.ctx.currentTime;
                } else {
                    accumulatedPause += mixer.ctx.currentTime - pausedAt;
                }

                lastIsPlaying = isPlaying;
            }

            if(isPlaying) {
                this.tick.set(mixer.ctx.currentTime - accumulatedPause);
            }

            requestAnimationFrame(onTick);
        }
        requestAnimationFrame(onTick);
    }
}