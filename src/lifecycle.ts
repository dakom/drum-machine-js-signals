export interface Component {
    // each component must have a render method
    // which simply gets run via `effect` 
    // and so it may return a cleanup function
    render: (() => () => void) | (() => void);
}