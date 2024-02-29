import Token, { TokenTypes } from "./token";

type ParserOptions = {
    keysToLowercase: boolean
}

export default class Parser {
    currentIndex: number = 0
    
    lineNumber: number = 1

    output: object = {}

    options: ParserOptions = {
        keysToLowercase: false
    }

    constructor(private tokens: Token[], options?: ParserOptions) {
        if(options) {
            this.options = {
                ...this.options,
                ...options
            }    
        }

        try {
            this.output = this.parse()
        } catch(err) {
            console.log((err as Error).message)
        }
        
        
    }

    parse(runUntil?: ()=> boolean) {
        let result: {[key: string]: unknown} = {}
        while(!this.isEOT()) {
            const token = this.peek()
            if(token.type === TokenTypes.NEWLINE) {
                this.lineNumber++
                this.currentIndex++
            }
            if(runUntil?.()) break
            const key = this.expect(TokenTypes.ATOM) as Token
            this.expect(TokenTypes.ASSIGN)
            const value = this.getValue()
            this.expect(TokenTypes.NEWLINE)
            this.lineNumber++
            
            result = {
                ...result,
               ...this.addToMap(key.value, value && value.value ? value.value : value )
            }

        }
        return result
    }

    peek() {
        return this.tokens[this.currentIndex]
    }

    seek() {
        return this.tokens[this.currentIndex++]
    }


    getValue() {
        const token = this.peek()

        if(token.type === TokenTypes.NEWLINE) return undefined

        if(token.type === TokenTypes.LBRAC) {
            this.seek()
            const result =  this.parse(()=> this.peek().type === TokenTypes.RBRAC)
            this.expect(TokenTypes.RBRAC)
            return result
        }

        const value = this.expect(TokenTypes.ATOM) as Token

        return value


    }

    expect(type: TokenTypes, strict: boolean = true) {
        const token = this.seek()
        if(token.type !== type) {
            if(strict) throw new Error(`Syntax Error 
            at Line ${this.lineNumber}.
            Expected: ${type}
            Got: ${token.type}`)
            return false
        }
        return token
    }

    addToMap(key: string, value: unknown) {
        const  {keysToLowercase} = this.options
        return {
            [keysToLowercase ? key.toLowerCase() : key]: value
        }
    }

    isEOT() {
        return this.currentIndex > this.tokens.length - 1
    }

    nextLine() {
        this.lineNumber++
    }
}