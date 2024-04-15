// adapted from the example here: https://github.com/tc39/proposal-signals/tree/main/packages/signal-polyfill#creating-a-simple-effect
// scheduling in the sense of "rendering" is *not* a consideration of the effect processing itself
// see: https://github.com/tc39/proposal-signals/issues/136#issuecomment-2051049286
import { Signal } from "signal-polyfill";

let needsEnqueue = true;

const watcher = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    queueMicrotask(processPending);
  }
});

function processPending() {
  needsEnqueue = true;

  for (const signal of watcher.getPending()) {
    signal.get();
  }

  watcher.watch();
}

export function effect(callback: () => () => void) {
  let cleanup = () => {};
  
  const computed = new Signal.Computed(() => {
    cleanup();
    cleanup = callback();
  });
  
  watcher.watch(computed);
  computed.get();
  
  return () => {
    watcher.unwatch(computed);
    cleanup();
  };
}