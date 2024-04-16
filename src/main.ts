import { Grid, GridLabels} from './grid';
import { Sliders } from './sliders';
import style from './main.module.css';
import { Playhead } from './playhead';
import { AudioMixer } from './mixer';
import { LoadingScreen } from './loading';
import { Ticker } from './tick';
import {effect} from "./polyfill"
import { Signal } from 'signal-polyfill';
import { Assets } from './assets';
import { CONFIG } from './config';
import { getPatternUrl, setPatternUrl } from './pattern';
import { PauseButton } from './pause';

// main container
const main = document.querySelector('#main') as HTMLDivElement;
main.classList.add(style.main);

// quick 'n dirty responsiveness
// everything is in rem, so just scale the root font size
const root = document.querySelector(":root") as HTMLElement;
function updateWindowSize() {
    const { innerWidth } = window;
    const scaleRatio = innerWidth / 1920;

    root.style.fontSize = `${16 * scaleRatio}px`;
}

window.addEventListener('resize', updateWindowSize);
updateWindowSize();

// initial state

export type InitialState = {
    kind: "loading"
} | {
    kind: "ready",
    assets: Assets,
} | {
    kind: "playing",
    mixer: AudioMixer,
    assets: Assets,
}

const initialState = new Signal.State<InitialState>({
    kind: "loading"
});

const loadingScreen = new LoadingScreen(initialState);
main.appendChild(loadingScreen.elem);

effect(() => {
    loadingScreen.render();
    const state = initialState.get();

    switch(state.kind) {
        case "loading":
            Assets.load()
                .then(assets => {
                    initialState.set({kind: "ready", assets});
                })
            break;

        case "ready":
            // wait for user to press start to create audio context and begin mixer etc.
            // since some devices require user interaction to create audio context
            loadingScreen.onStart = () => {
                const mixer = new AudioMixer();
                initialState.set({kind: "playing", assets: state.assets, mixer});
            }

            if(CONFIG.DEBUG_AUTO_START) {
                // effect won't be seen if we set immediately
                queueMicrotask(loadingScreen.onStart);
            }
            break;
        case "playing":
            const {mixer, assets} = state;
            mixer.assignAssets(assets)
                .then(() => {
                    // audio is ready, create the components
                    const sliders = new Sliders();
                    const pauseButton = new PauseButton();
                    const ticker = new Ticker(mixer, pauseButton);
                    const playhead = new Playhead(ticker, sliders);
                    const grid = new Grid(playhead);
                    const gridLabels = new GridLabels();


                    // append them to the main container
                    // with a bit of layout help
                    const gridAndPlayheadElem = document.createElement('div');
                    gridAndPlayheadElem.classList.add(style.gridAndPlayhead);
                    gridAndPlayheadElem.appendChild(grid.elem);
                    gridAndPlayheadElem.appendChild(playhead.elem);

                    const gridAndLabelsElem = document.createElement('div');
                    gridAndLabelsElem.classList.add(style.gridAndLabels);
                    gridAndLabelsElem.appendChild(gridLabels.elem);
                    gridAndLabelsElem.appendChild(gridAndPlayheadElem);

                    const app = document.createElement('div');
                    app.classList.add(style.app);
                    app.appendChild(gridAndLabelsElem);
                    app.appendChild(sliders.elem);
                    app.appendChild(pauseButton.elem);

                    main.appendChild(app);

                    // apply the initial pattern
                    const pattern = getPatternUrl() ?? CONFIG.INITIAL_PATTERN;

                    grid.setPattern(pattern);
                    sliders.setPattern(pattern);

                    // kick off the renderer for the components that render every tick 
                    effect(() => {
                        [grid, playhead].forEach(renderable => renderable.renderOnTick());
                        return () => {}
                    });

                    // kick off the renderer for the components that render on immediate state changes
                    effect(() => {
                        [pauseButton].forEach(renderable => renderable.renderOnState());
                        return () => {}
                    });

                    // kick off the audio effects
                    let lastPlayedNote = -1;
                    effect(() => {
                        mixer.setVolume(sliders.volume().get());
                        const audioIdsToPlay = grid.playingAudioIds.get();
                        if(audioIdsToPlay.note !== lastPlayedNote) {
                            lastPlayedNote = audioIdsToPlay.note;
                            mixer.playSounds(audioIdsToPlay.ids);
                        }
                        return () => {}
                    });

                    // kick off the url updater
                    effect(() => {
                        const pattern = {
                            speed: sliders.speed().get(),
                            volume: sliders.volume().get(),
                            notes: grid.patternNotes.get(),
                        }
                        setPatternUrl(pattern);
                        return () => {}
                    })

                })
            break;
        // exhaustiveness
        default: state satisfies never;
    }
    return () => { }
})
