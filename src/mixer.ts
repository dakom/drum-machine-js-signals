import { Assets } from "./assets";
import { Grid } from "./grid";
import { effect } from "./polyfill";
import { Sliders } from "./sliders";

export type AudioId = string;

export class AudioMixer {
    public ctx: AudioContext;
    private buffers: Map<AudioId, AudioBuffer> = new Map();
    private masterGain: GainNode;
    private trackGains: Map<AudioId, GainNode> = new Map();
    private lastPlayedNote = -1;
    private grid?: Grid;
    private sliders?: Sliders;

    constructor() {
        this.ctx = new AudioContext()
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

    }

    async assignAssets(assets: Assets) {
        const results = await Promise.all(Object.entries(assets.audioData).map(async ([id, arrayBuffer]) => {
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            return { id, audioBuffer };
        }))

        for(const { id, audioBuffer } of results) {
            this.buffers.set(id, audioBuffer);

            const trackGain = this.ctx.createGain();
            trackGain.connect(this.masterGain);
            this.trackGains.set(id, trackGain);
        }
    }

    setMasterVolume(volume: number) {
        this.masterGain.gain.value = volume;
    }

    setTrackVolume(id: AudioId, volume: number) {
        this.trackGains.get(id)!.gain.value = volume;
    }

    playSounds(ids: AudioId[]) {
        ids.forEach(id => {
            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers.get(id)!;
            source.connect(this.trackGains.get(id)!);
            source.start();
        });
    }

    connect(grid: Grid, sliders: Sliders) {
        this.grid = grid;
        this.sliders = sliders;
    }

    component = () => {
        effect(() => {
            this.setMasterVolume(this.sliders!.volume().get());
            const audioIdsToPlay = this.grid!.playingAudioIds.get();
            if(audioIdsToPlay.note !== this.lastPlayedNote) {
                this.lastPlayedNote = audioIdsToPlay.note;
                this.playSounds(audioIdsToPlay.ids);
            }
        });
    }
}