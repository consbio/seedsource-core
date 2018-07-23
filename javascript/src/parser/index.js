import { parser } from './grammar.jison'

export const getNames = s => {
    let { lexer } = parser
    let variables = []

    lexer.setInput(s)

    let token
    do {
        token = lexer.lex()
        if (token === parser.symbols_.ID) {
            variables.push(lexer.yytext)
        }
    } while (token !== false && token !== lexer.EOF)

    return variables
}

export default (expr, context = {}) => {
    parser.yy.context = context
    return parser.parse(expr)
}

// export default Object.assign(parser, {
//     // Get variable names in a given genecological function string
//     getNames: s => {
//         let { lexer } = parser
//         let variables = []
//
//         lexer.setInput(s)
//
//         let token
//         do {
//             token = lexer.lex()
//             if (token === parser.symbols_.ID) {
//                 variables.push(lexer.yytext)
//             }
//         } while (token !== false && token !== lexer.EOF)
//
//         return variables
//     }
// })
