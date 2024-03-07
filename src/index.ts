import Lexer from "./lexer";
import Parser from "./parser";
import * as fs from "fs"

const FILE_EXTENSION = "env"


const lexer = new Lexer(fs.readFileSync(__dirname+"/../.env").toString("utf-8"))

const parser = new Parser(lexer.tokens)

// process.env = {
//     ...process.env,
//     ...parser.output
// }

console.log(parser.output)