import { Assets } from "./assets";

export type AudioId = string;

export class AudioMixer {
    public ctx: AudioContext;
    private buffers: Map<AudioId, AudioBuffer> = new Map();
    private gainNode: GainNode;

    constructor() {
        this.ctx = new AudioContext()
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
    }

    async assignAssets(assets: Assets) {
        const results = await Promise.all(Object.entries(assets.audioData).map(async ([id, arrayBuffer]) => {
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            return { id, audioBuffer };
        }))

        for(const { id, audioBuffer } of results) {
            this.buffers.set(id, audioBuffer);
        }
    }

    setVolume(volume: number) {
        this.gainNode.gain.value = volume;
    }

    playSounds(ids: AudioId[]) {
        ids.forEach(id => {
            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers.get(id)!;
            source.connect(this.gainNode);
            source.start();
        });
    }
}