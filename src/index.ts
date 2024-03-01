import Lexer from "./lexer";
import Parser from "./parser";


const lexer = new Lexer(`
    >AB=[]
    BZ=[
        XF=[
            DS=4
        ]
    ]
`)

console.log(lexer.tokens)

const parser = new Parser(lexer.tokens)

console.log(parser.output)
