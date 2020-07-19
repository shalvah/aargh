declare const makeErrorChecker: (e: object) => {
    [x: string]: boolean | object;
    e: object;
    matched: boolean;
    result: any;
    type(errorType: Function | Function[], callback: (error: object) => any): any;
    catch(errorType: Function | Function[], callback: (error: object) => any): any;
    throw(): any;
    others(callback: (error: object) => any): any;
};
export = makeErrorChecker;
