import { Signal } from "signal-polyfill";
import style from "./loading.module.css";
import { InitialState } from "./main";

export class LoadingScreen {
    public readonly elem: HTMLDivElement;
    private loadingElem: HTMLDivElement | undefined;
    private startElem: HTMLDivElement | undefined;
    private githubElem: HTMLAnchorElement | undefined;

    public onStart: (() => void) | undefined;

    constructor(private initialState: Signal.State<InitialState>) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.container);
    }

    render() {
        const kind = this.initialState.get().kind;

        switch(kind) {
            case "loading":
                this.loadingElem = document.createElement('div');
                this.loadingElem.innerText = 'Loading';
                this.loadingElem.classList.add(style.loading);
                this.elem.appendChild(this.loadingElem);

                this.githubElem = document.createElement('a');
                this.githubElem.href = 'https://github.com/dakom/drum-machine-js-signals';
                this.githubElem.classList.add(style.github);
                const textElem = document.createElement('div');
                textElem.innerText = 'github repo';
                textElem.classList.add(style.githubText);
                const imgElem = document.createElement('img');
                imgElem.src = 'image/github-mark.svg';
                imgElem.classList.add(style.githubImage);
                this.githubElem.appendChild(imgElem);
                this.githubElem.appendChild(textElem);
                this.elem.appendChild(this.githubElem);
                break;
            case "ready":
                this.elem.removeChild(this.loadingElem!);
                this.elem.removeChild(this.githubElem!);

                this.startElem = document.createElement('div');
                this.startElem.innerText = 'Start';
                this.startElem.classList.add(style.button);
                this.elem.appendChild(this.startElem);
                this.elem.appendChild(this.githubElem!);

                this.startElem.addEventListener('click', () => {
                    if(this.onStart) {
                        this.onStart();
                    } else {
                        console.error("No onStart handler set");
                    }
                })
                break;
            case "playing":
                if(this.elem) {
                    this.elem.remove();
                }
        }
    }
}