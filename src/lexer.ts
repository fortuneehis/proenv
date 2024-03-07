import operators from "./operators"
import Token, { TokenTypes } from "./token"


export default class Lexer {
    private index: number = 0
    private lastIndex: number = this.source.length - 1
    tokens: Token[] = []

    constructor(private source: string) {
        this.tokenize()
    } 
    
    private seek() {
        return this.source[this.index++]
    }

    private isEOF() {
        return this.index > this.lastIndex
    }

    private tokenize() {

        while(!this.isEOF()) {
            const char = this.seek()
            if(this.isWhitespace(char)) continue
            let token: Token | undefined
            switch(char) {
                case "=": 
                    token = new Token(TokenTypes.ASSIGN, char)
                    break
                case "[":
                    token = new Token(TokenTypes.LBRAC, char)
                    break
                case "]": 
                    token = new Token(TokenTypes.RBRAC, char)
                    break
                case ">":
                    token = new Token(TokenTypes.VAR, char)
                    break
                case "%": 
                    token = new Token(TokenTypes.PRIVATE_VARS, char)
                    break
                case "#":
                    const comment = this.readAtom((char)=> char === "\n")
                    token = new Token(TokenTypes.COMMENT, comment)
                    break
                case "\n": 
                    token = new Token(TokenTypes.NEWLINE, char)
                    break
                default: 
                    const atom = this.readAtom((char)=> this.isWhitespace(char) 
                    || operators[char] !== undefined 
                    || char === "\n")
                    token = new Token(TokenTypes.ATOM, atom)
            }

            this.tokens.push(token)

        }

        if(!this.isNewline(this.source[this.lastIndex])) {
            const autoNewLineToken = new Token(TokenTypes.NEWLINE, "\n")
            this.tokens.push(autoNewLineToken)
        }
    }

    private isWhitespace(char: string) {
        return char === " "
    }

    private isNewline(char: string) {
        return char === "\n"
    }

    private readAtom(until: (char: string)=> boolean) {
        this.index--
        let atom = ""

        while(!this.isEOF()) {
            const char = this.seek()

            if(until(char)) {
                this.index--
                break
            }

            atom += char
        }
        return atom
    }
}