import { CONFIG } from "./config";
import { AudioId } from "./mixer";

export class Assets {
    constructor(public readonly audioData: Record<AudioId, ArrayBuffer>) {
    }

    static async load() {
        const results = await Promise.all(CONFIG.AUDIO.map(async ({ id, file }) => {
            const response = await fetch(`audio/${file}`);
            const arrayBuffer = await response.arrayBuffer();
            return { id, arrayBuffer };
        }))

        return new Assets(results.reduce((acc, { id, arrayBuffer }) => {
            acc[id] = arrayBuffer;
            return acc;
        }, {} as Record<AudioId, ArrayBuffer>));
    }
}