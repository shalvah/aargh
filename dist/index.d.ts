declare const makeErrorChecker: (e: object) => {
    e: object;
    matched: boolean;
    result: any;
    type(errorType: Function | Function[], callback: (error: object) => any): any;
    handle(errorType: Function | Function[], callback: (error: object) => any): any;
    throw(): any;
    others(callback: (error: object) => any): any;
};
export = makeErrorChecker;
