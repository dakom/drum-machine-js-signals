import { Signal } from "signal-polyfill";
import style from "./loading.module.css";
import { Assets } from "./assets";
import { AudioMixer } from "./mixer";
import { effect } from "./polyfill";
import { CONFIG } from "./config";


type LoadingState = {
    kind: "loading"
} | {
    kind: "ready",
    assets: Assets
}

type OnStart = ({mixer, assets}: {mixer: AudioMixer, assets: Assets}) => void;

export class LoadingScreen {
    public readonly elem: HTMLDivElement;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.container);
    }

    render(onStart: OnStart) {
        const stateSignal = new Signal.State<LoadingState>({kind: "loading"});

        effect(() => {
            const state = stateSignal.get();

            const githubHtml = `
                <a class="${style.github}" href="https://github.com/dakom/drum-machine-js-signals">
                    <img class="${style.githubImage}" src="image/github-mark.svg">
                    <div class="${style.githubText}">github repo</div>
                </a>
            `;

            switch(state.kind) {
                case "loading":
                    this.elem.innerHTML = `
                        <div class="${style.loading}">Loading</div>
                        ${githubHtml}
                    `

                    Assets.load()
                        .then(assets => {
                            stateSignal.set({kind: "ready", assets});
                        })

                    break;
                case "ready":
                    this.elem.innerHTML = `
                        <div id="start" class="${style.button}">Start</div>
                        ${githubHtml}
                    `

                    const clickHandler = () => {
                        const mixer = new AudioMixer();
                        onStart({mixer, assets: state.assets});
                    }

                    // wait for user to press start to create audio context and begin mixer etc.
                    // since some devices require user interaction to create audio context
                    this.elem.querySelector("#start")!.addEventListener('click', clickHandler)

                    if(CONFIG.DEBUG_AUTO_START) {
                        // effect won't be seen if we set immediately
                        queueMicrotask(clickHandler);
                    }
                    break;
            }
        })
    }
}