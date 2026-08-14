; Keywords
[
  "package"
  "uses"
  "class"
  "interface"
  "enum"
  "enhancement"
  "annotation"
  "extends"
  "implements"
  "represents"
  "construct"
  "function"
  "property"
  "var"
  "delegate"
  "as"
  "typeas"
  "typeis"
  "typeof"
  "statictypeof"
  "readonly"
  "get"
  "set"
  "final"
  "static"
  "abstract"
  "override"
  "transient"
  "private"
  "internal"
  "protected"
  "public"
  "block"
  "new"
  "eval"
] @keyword

[
  "if"
  "else"
  "try"
  "catch"
  "finally"
  "throw"
  "return"
  "for"
  "foreach"
  "in"
  "index"
  "iterator"
  "while"
  "do"
  "switch"
  "case"
  "default"
  "assert"
  "using"
] @keyword.control

[(break_statement) (continue_statement)] @keyword.control

[(this) (super)] @variable.builtin

[(true) (false) (null_literal)] @constant.builtin

(number_literal) @number
(string_literal) @string

(line_comment) @comment
(block_comment) @comment

(identifier) @variable

[
  "("
  ")"
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "."
] @punctuation.delimiter

[
  "="
  "=="
  "==="
  "!="
  "!=="
  "<"
  ">"
  "<="
  ">="
  "+"
  "-"
  "*"
  "/"
  "%"
  "&&"
  "||"
  "!"
  "&"
  "|"
  "^"
  "~"
  "?:"
  "?"
  "->"
  "as"
] @operator

(class_declaration name: (identifier) @type)
(interface_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(enhancement_declaration name: (identifier) @type)
(class_or_interface_type) @type

(function_declaration name: (identifier) @function)
(constructor_declaration) @constructor
(property_declaration name: (identifier) @property)
