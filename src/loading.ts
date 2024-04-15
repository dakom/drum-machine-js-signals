import { Signal } from "signal-polyfill";
import style from "./loading.module.css";
import { InitialState } from "./main";

export class LoadingScreen {
    public readonly elem: HTMLDivElement;
    private textElem: HTMLDivElement | undefined;
    private buttonElem: HTMLDivElement | undefined;
    public onStart: (() => void) | undefined;

    constructor(private initialState: Signal.State<InitialState>) {
        this.elem = document.createElement('div');
        this.elem.classList.add(style.container);
    }

    render() {
        const kind = this.initialState.get().kind;

        switch(kind) {
            case "loading":
                this.textElem = document.createElement('div');
                this.textElem.innerText = 'Loading...';
                this.textElem.classList.add(style.loading);
                this.elem.appendChild(this.textElem);
                break;
            case "ready":
                this.elem.removeChild(this.textElem!);

                this.buttonElem = document.createElement('div');
                this.buttonElem.innerText = 'Start';
                this.buttonElem.classList.add(style.button);
                this.elem.appendChild(this.buttonElem);

                this.buttonElem.addEventListener('click', () => {
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