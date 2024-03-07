import Token, { TokenTypes } from "./token";

type ParserOptions = {
    keysToLowercase: boolean
}

export default class Parser {
    private currentIndex: number = 0
    
    private lineNumber: number = 1

    private privatePairs: { [key: string]: any } = {}

    output: { [key: string]: any } = {}

    private options: ParserOptions = {
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
            this.output = this.parse(true)
        } catch(err) {
            console.log((err as Error).message)
        } 
    }

    private parse(init: boolean, runUntil?: ()=> boolean) {
        
        let result: {[key: string]: unknown} = {}
        let parsingPrivatePairs = init

        while(!this.isEOT()) {
            const token = this.peek()
            if(token.type === TokenTypes.NEWLINE || token.type === TokenTypes.COMMENT) {
                this.nextLine()
                this.currentIndex++
                continue
            }

            if(parsingPrivatePairs && token.type === TokenTypes.VAR) {
                
                const {key, value} = this.parsePrivatePairs()
                
                this.privatePairs = {
                    ...this.privatePairs,
                    [key]: value
                }
                continue
            } 
            

            if(this.peek().type === TokenTypes.VAR) {
                throw new Error("Private key-value pairs should be declared before the public key-value pairs")
            }

            if(runUntil?.()) break
            const {key, value} = this.parseExpression()
            
            parsingPrivatePairs = false

        
            result = {
                ...result,
                ...this.addToMap(key, value) 
            }

        }
        return result
    }

    private peek() {
        return this.tokens[this.currentIndex]
    }

    private seek() {
        return this.tokens[this.currentIndex++]
    }


    private getValue() {
        const token = this.peek()

        if(token.type === TokenTypes.NEWLINE) return undefined

        if(token.type === TokenTypes.LBRAC) {
            this.seek()
            const result =  this.parse(false, ()=> this.peek().type === TokenTypes.RBRAC)
            this.expect(TokenTypes.RBRAC)
            return result
        }

        const value = this.expect(TokenTypes.ATOM) as Token

        return value


    }

    private expect(type: TokenTypes, strict: boolean = true): Token | false {
        const token = this.seek()
        if(token.type === TokenTypes.COMMENT) {
            this.nextLine()
            this.expect(TokenTypes.NEWLINE)
            return this.expect(type, strict)
        }
        if(token.type !== type) {
            if(strict) throw new Error(`Syntax Error 
            at Line ${this.lineNumber}.
            Expected: ${type}
            Got: ${token.type}`)
            return false
        }
        return token
    }


    private addToMap(key: string, value: unknown) {
        const  {keysToLowercase} = this.options
        return {
            [keysToLowercase ? key.toLowerCase() : key]: value
        }
    }

    private parsePrivatePairs() {
        this.expect(TokenTypes.VAR)
        const {key, value} = this.parseExpression()
        return {
            key,
            value
        }
    }

    private parseExpression() {
        const key = this.expect(TokenTypes.ATOM) as Token
        if(!/^[a-zA-Z]+$/ig.test(key.value)) throw new Error(`Keys should on contain alphabets at line ${this.lineNumber}`) 
        this.expect(TokenTypes.ASSIGN)
        const value = this.getValue()
        this.expect(TokenTypes.NEWLINE)
        this.nextLine()

        return {
            key: key.value,
            value: value && value.value ? value.value : value
        }
    }

    
    private isEOT() {
        return this.currentIndex > this.tokens.length - 1
    }

    private nextLine() {
        this.lineNumber++
    }
}

