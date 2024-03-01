
export enum TokenTypes {
    NEWLINE = "NEWLINE",
    ASSIGN  = "ASSIGN",
    LBRAC = "LBRAC",
    RBRAC = "RBRAC",
    SEPERATOR = "SEPERATOR",
    ATOM = "ATOM",
    EOF = "EOF"
}


export default class Token {
    constructor(
        public type: string, 
        public value: string, 
        ) {

    }
}