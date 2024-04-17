import { Grid, GridLabels} from './grid';
import { Sliders } from './sliders';
import style from './main.module.css';
import { Playhead } from './playhead';
import { AudioMixer } from './mixer';
import { LoadingScreen } from './loading';
import { Ticker } from './tick';
import { Assets } from './assets';
import { PatternManager} from './pattern';
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

const loadingScreen = new LoadingScreen();
main.appendChild(loadingScreen.elem);

loadingScreen.render(async ({mixer, assets}: {mixer: AudioMixer, assets: Assets}) => {
    loadingScreen.elem.remove();
    await mixer.assignAssets(assets)


    // audio is ready, create the components
    const sliders = new Sliders();
    const pauseButton = new PauseButton();
    const ticker = new Ticker(mixer, pauseButton);
    const playhead = new Playhead(ticker, sliders);
    const grid = new Grid(playhead);
    const gridLabels = new GridLabels(mixer);
    const patternManager = new PatternManager(grid, sliders);

    // we have a cyclical dependency here, so we need to connect them after they're all created
    mixer.connect(grid, sliders);

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
    const pattern = patternManager.getInitial();

    grid.setPattern(pattern);
    sliders.setPattern(pattern);

    // kick off all components
    [grid, playhead, pauseButton, gridLabels, mixer, patternManager, ticker]
        .forEach(({component}) => component());
});