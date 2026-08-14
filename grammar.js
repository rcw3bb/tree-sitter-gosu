/**
 * @file Gosu grammar for tree-sitter
 * @author Ron Webb <ron@ronella.xyz>
 * @license MIT
 *
 * Translated from the ANTLR grammar at
 * gosu-lsp/server/src/main/antlr/xyz/ronella/gosu/lsp/GosuLanguage.g4
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const HEX_DIGITS = /[0-9a-fA-F]+/;
const INT_SUFFIX = /(?:[lLsS]|bi|BI|[bB])/;
const FLOAT_SUFFIX = /(?:[fFdD]|bd|BD)/;
const EXPONENT = /[eE][+-]?[0-9]+/;
const ESCAPE_SEQUENCE = /\\(?:[vabtfrn"'\\$<]|u[0-9a-fA-F]{4}|[0-3][0-7][0-7]|[0-7][0-7]|[0-7])/;

const PREC = {
  ASSIGN: 1,
  ELVIS: 2,
  TERNARY: 3,
  OR: 4,
  AND: 5,
  BIT_OR: 6,
  BIT_XOR: 7,
  BIT_AND: 8,
  EQUALITY: 9,
  REL: 10,
  INTERVAL: 11,
  SHIFT: 12,
  ADD: 13,
  MULT: 14,
  TYPE_AS: 15,
  UNARY: 16,
  MEMBER: 17,
};

const BINARY_OPERATORS = [
  ['||', PREC.OR],
  ['or', PREC.OR],
  ['&&', PREC.AND],
  ['and', PREC.AND],
  ['|', PREC.BIT_OR],
  ['^', PREC.BIT_XOR],
  ['&', PREC.BIT_AND],
  ['===', PREC.EQUALITY],
  ['!==', PREC.EQUALITY],
  ['==', PREC.EQUALITY],
  ['!=', PREC.EQUALITY],
  ['<>', PREC.EQUALITY],
  ['<=', PREC.REL],
  ['>=', PREC.REL],
  ['<', PREC.REL],
  ['>', PREC.REL],
  ['|..|', PREC.INTERVAL],
  ['|..', PREC.INTERVAL],
  ['..|', PREC.INTERVAL],
  ['..', PREC.INTERVAL],
  ['<<', PREC.SHIFT],
  ['>>>', PREC.SHIFT],
  ['>>', PREC.SHIFT],
  ['?+', PREC.ADD],
  ['?-', PREC.ADD],
  ['+', PREC.ADD],
  ['-', PREC.ADD],
  ['?*', PREC.MULT],
  ['?/', PREC.MULT],
  ['?%', PREC.MULT],
  ['*', PREC.MULT],
  ['/', PREC.MULT],
  ['%', PREC.MULT],
];

const ASSIGNMENT_OPERATORS = [
  '=', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>>=', '>>=',
];

module.exports = grammar({
  name: 'gosu',

  extras: $ => [
    $.line_comment,
    $.block_comment,
    /\s/,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$._simple_class_or_interface_type],
    [$._type, $.intersection_type],
    [$._unannotated_type, $.array_type],
    [$._unannotated_type, $.scoped_class_or_interface_type],
    [$.block_parameter, $._simple_class_or_interface_type],
    [$.class_body, $.initializer_expression],
    [$.statement_block, $.initializer_expression],
    [$.return_statement],
    [$.expression_statement, $.array_value_list],
    [$.scoped_class_or_interface_type],
    [$.block_literal],
  ],

  rules: {
    // ============================================================
    // Compilation unit
    // ============================================================

    compilation_unit: $ => seq(
      optional($.package_declaration),
      repeat($.uses_declaration),
      repeat($._top_level_declaration),
    ),

    package_declaration: $ => seq('package', field('name', $.qualified_name), optional(';')),

    uses_declaration: $ => seq(
      'uses',
      field('name', $.identifier),
      repeat(seq('.', choice(field('name', $.identifier), '*'))),
      optional(';'),
    ),

    qualified_name: $ => sep1($.identifier, '.'),

    _top_level_declaration: $ => seq(
      field('modifiers', optional($.modifiers)),
      choice(
        $.class_declaration,
        $.interface_declaration,
        $.enum_declaration,
        $.enhancement_declaration,
        $.annotation_declaration,
      ),
    ),

    // ── Modifiers & annotations ──────────────────────────────────

    modifiers: $ => repeat1(choice(
      $.annotation,
      'private', 'internal', 'protected', 'public',
      'static', 'abstract', 'override', 'final', 'transient', 'reified',
    )),

    annotation: $ => seq(
      '@',
      field('name', $.qualified_name),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('arguments', $.annotation_arguments)),
    ),

    annotation_arguments: $ => seq('(', commaSep($._argument), ')'),

    // ── Type declarations ────────────────────────────────────────

    class_declaration: $ => seq(
      'class',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('superclass', $.superclass)),
      optional(field('interfaces', $.super_interfaces)),
      field('body', $.class_body),
    ),

    superclass: $ => seq('extends', $._type),

    super_interfaces: $ => seq('implements', $.type_list),

    type_list: $ => sep1($._type, ','),

    annotation_declaration: $ => seq(
      'annotation',
      field('name', $.identifier),
      field('body', $.annotation_body),
    ),

    annotation_body: $ => seq(
      '{',
      repeat($._annotation_member_declaration),
      '}',
    ),

    _annotation_member_declaration: $ => seq(
      field('modifiers', optional($.modifiers)),
      $.annotation_method_declaration,
      optional(';'),
    ),

    // annotation method: function name() : Type  or  function name() : Type = default
    annotation_method_declaration: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameters),
      optional(seq(':', field('return_type', $._type))),
      optional(seq('=', field('default', $._expression))),
    ),

    interface_declaration: $ => seq(
      'interface',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(seq(choice('extends', 'implements'), field('interfaces', $.type_list))),
      field('body', $.interface_body),
    ),

    enum_declaration: $ => seq(
      'enum',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('interfaces', $.super_interfaces)),
      field('body', $.enum_body),
    ),

    enhancement_declaration: $ => seq(
      'enhancement',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      ':',
      field('type', $.class_or_interface_type),
      field('dimensions', optional($.dimensions)),
      field('body', $.enhancement_body),
    ),

    class_body: $ => seq('{', repeat($._class_member_declaration), '}'),

    _class_member_declaration: $ => seq(
      field('modifiers', optional($.modifiers)),
      $._member,
      optional(';'),
    ),

    _member: $ => choice(
      $.function_declaration,
      $.constructor_declaration,
      $.property_declaration,
      $.field_declaration,
      $.delegate_declaration,
      $.class_declaration,
      $.interface_declaration,
      $.enum_declaration,
      $.annotation_declaration,
    ),

    interface_body: $ => seq('{', repeat($._interface_member_declaration), '}'),

    _interface_member_declaration: $ => seq(
      field('modifiers', optional($.modifiers)),
      choice(
        $.function_declaration,
        $.property_declaration,
        $.field_declaration,
        $.class_declaration,
        $.interface_declaration,
        $.enum_declaration,
      ),
      optional(';'),
    ),

    enhancement_body: $ => seq('{', repeat($._enhancement_member_declaration), '}'),

    _enhancement_member_declaration: $ => seq(
      field('modifiers', optional($.modifiers)),
      choice(
        $.function_declaration,
        $.property_declaration,
      ),
      optional(';'),
    ),

    enum_body: $ => seq(
      '{',
      optional($.enum_constants),
      repeat($._class_member_declaration),
      '}',
    ),

    enum_constants: $ => seq(
      sep1($.enum_constant, ','),
      optional(','),
      optional(';'),
    ),

    enum_constant: $ => seq(
      field('name', $.identifier),
      optional(field('arguments', $.argument_list)),
    ),

    delegate_declaration: $ => seq(
      'delegate',
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      'represents',
      field('interfaces', $.type_list),
      optional(seq('=', field('value', $._expression))),
    ),

    // ── Member declarations ──────────────────────────────────────

    type_parameters: $ => seq('<', sep1($.type_parameter, ','), '>'),

    type_parameter: $ => seq(
      field('name', $.identifier),
      optional(seq('extends', field('bound', $._type))),
    ),

    field_declaration: $ => seq(
      'var',
      field('name', $.identifier),
      optional($._type_annotation),
      optional(seq('as', optional('readonly'), field('alias', $.identifier))),
      optional(seq('=', field('value', $._expression))),
    ),

    property_declaration: $ => seq(
      'property',
      field('accessor', choice('get', 'set')),
      field('name', $.identifier),
      field('parameters', $.parameters),
      optional(seq(':', field('return_type', $._type))),
      field('body', optional($.statement_block)),
    ),

    function_declaration: $ => seq(
      'function',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameters),
      optional(seq(':', field('return_type', $._type))),
      field('body', optional($.statement_block)),
    ),

    constructor_declaration: $ => seq(
      'construct',
      field('parameters', $.parameters),
      optional(seq(':', field('return_type', $._type))),
      field('body', $.statement_block),
    ),

    parameters: $ => seq('(', commaSep($.parameter), ')'),

    parameter: $ => seq(
      repeat($.annotation),
      optional('final'),
      field('name', $.identifier),
      optional(choice(
        seq(':', field('type', $._type), optional(seq('=', field('default', $._expression)))),
        field('type', $.block_literal),
        seq('=', field('default', $._expression)),
      )),
    ),

    _type_annotation: $ => choice(
      seq(':', field('type', $._type)),
      field('type', $.block_literal),
    ),

    // ── Statements ───────────────────────────────────────────────

    statement_block: $ => seq('{', repeat($._statement), '}'),

    _statement: $ => choice(
      $.if_statement,
      $.try_statement,
      $.throw_statement,
      $.continue_statement,
      $.break_statement,
      $.return_statement,
      $.for_statement,
      $.while_statement,
      $.do_statement,
      $.switch_statement,
      $.using_statement,
      $.assert_statement,
      $.local_variable_declaration,
      $.expression_statement,
      $.statement_block,
      ';',
    ),

    if_statement: $ => prec.right(seq(
      'if', '(', field('condition', $._expression), ')',
      field('consequence', $._statement),
      optional(seq('else', field('alternative', $._statement))),
    )),

    try_statement: $ => seq(
      'try',
      field('body', $.statement_block),
      choice(
        repeat1($.catch_clause),
        seq(repeat($.catch_clause), $.finally_clause),
      ),
    ),

    catch_clause: $ => seq(
      'catch', '(',
      optional('var'),
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      ')',
      field('body', $.statement_block),
    ),

    finally_clause: $ => seq('finally', $.statement_block),

    assert_statement: $ => seq(
      'assert',
      field('condition', $._expression),
      optional(seq(':', field('message', $._expression))),
    ),

    using_statement: $ => seq(
      'using', '(',
      choice(
        sep1($.local_variable_declaration, ','),
        $._expression,
      ),
      ')',
      field('body', $.statement_block),
      optional($.finally_clause),
    ),

    return_statement: $ => choice(
      prec.dynamic(1, seq('return', field('value', $._expression))),
      'return',
    ),

    continue_statement: _ => 'continue',

    break_statement: _ => 'break',

    while_statement: $ => seq('while', '(', field('condition', $._expression), ')', field('body', $._statement)),

    do_statement: $ => seq(
      'do', field('body', $._statement),
      'while', '(', field('condition', $._expression), ')',
    ),

    switch_statement: $ => seq('switch', '(', field('value', $._expression), ')', '{', repeat($.switch_group), '}'),

    switch_group: $ => prec.left(seq(
      repeat1(choice(
        seq('case', field('value', $._expression), ':'),
        seq('default', ':'),
      )),
      repeat($._statement),
    )),

    throw_statement: $ => seq('throw', field('value', $._expression)),

    local_variable_declaration: $ => prec.right(seq(
      optional('final'),
      'var',
      field('name', $.identifier),
      optional($._type_annotation),
      optional(seq('=', field('value', $._expression))),
    )),

    expression_statement: $ => $._expression,

    for_statement: $ => seq(
      choice('foreach', 'for'),
      '(',
      $.for_control,
      ')',
      field('body', $._statement),
    ),

    for_control: $ => choice(
      seq(field('value', $._expression), optional($.index_variable)),
      seq(
        optional('var'),
        field('name', $.identifier),
        'in',
        field('value', $._expression),
        optional(choice(
          seq($.index_variable, $.iterator_variable),
          seq($.iterator_variable, $.index_variable),
          $.index_variable,
          $.iterator_variable,
        )),
      ),
    ),

    index_variable: $ => seq('index', field('name', $.identifier)),

    iterator_variable: $ => seq('iterator', field('name', $.identifier)),

    // ── Expressions ──────────────────────────────────────────────

    _expression: $ => choice(
      $.assignment_expression,
      $.elvis_expression,
      $.ternary_expression,
      $.binary_expression,
      $.typeis_expression,
      $.type_as_expression,
      $.unary_expression,
      $.update_expression,
      $._primary_expression,
    ),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._expression),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      field('right', $._expression),
    )),

    elvis_expression: $ => prec.left(PREC.ELVIS, seq(
      field('left', $._expression),
      '?:',
      field('right', $._expression),
    )),

    ternary_expression: $ => prec.right(PREC.TERNARY, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    binary_expression: $ => choice(...BINARY_OPERATORS.map(([operator, precedence]) =>
      prec.left(precedence, seq(
        field('left', $._expression),
        field('operator', operator),
        field('right', $._expression),
      )),
    )),

    typeis_expression: $ => prec.left(PREC.REL, seq(
      field('value', $._expression),
      'typeis',
      field('type', $._type),
    )),

    type_as_expression: $ => prec.left(PREC.TYPE_AS, seq(
      field('value', $._expression),
      choice('as', 'typeas'),
      field('type', $._type),
    )),

    unary_expression: $ => prec(PREC.UNARY, seq(
      field('operator', choice('+', '-', '~', '!', 'not', 'typeof', 'statictypeof')),
      field('operand', $._expression),
    )),

    update_expression: $ => choice(
      prec(PREC.UNARY, seq(field('operator', choice('++', '--')), field('operand', $._expression))),
      prec.left(PREC.MEMBER, seq(field('operand', $._expression), field('operator', choice('++', '--')))),
    ),

    _primary_expression: $ => choice(
      $._literal,
      $.this,
      $.super,
      $.identifier,
      $.parenthesized_expression,
      $.eval_expression,
      $.object_creation_expression,
      $.array_creation_expression,
      $.member_access,
      $.feature_literal,
      $.index_access,
      $.call_expression,
      $.block_expression,
      $.initializer_expression,
    ),

    this: _ => 'this',

    super: _ => 'super',

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    eval_expression: $ => seq('eval', '(', $._expression, ')'),

    member_access: $ => prec(PREC.MEMBER, seq(
      field('object', $._expression),
      field('operator', choice('.', '?.', '*.')),
      field('name', $.identifier),
    )),

    feature_literal: $ => prec(PREC.MEMBER, seq(
      field('object', $._expression),
      '#',
      field('name', choice($.identifier, 'construct')),
    )),

    index_access: $ => prec(PREC.MEMBER, seq(
      field('object', $._expression),
      field('operator', choice('[', '?[')),
      field('index', $._expression),
      ']',
    )),

    call_expression: $ => prec(PREC.MEMBER, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq('(', commaSep($._argument), ')'),

    _argument: $ => choice(
      $.named_argument,
      $._expression,
    ),

    named_argument: $ => seq(':', field('name', $.identifier), '=', field('value', $._expression)),

    object_creation_expression: $ => prec.right(seq(
      'new',
      optional(field('type', $.class_or_interface_type)),
      field('arguments', $.argument_list),
      optional(field('body', choice(prec.dynamic(1, $.class_body), $.initializer_expression))),
    )),

    array_creation_expression: $ => prec.right(choice(
      seq(
        'new',
        optional(field('type', $.class_or_interface_type)),
        field('dimensions_expr', repeat1($.dimensions_expr)),
        field('dimensions', optional($.dimensions)),
      ),
      seq(
        'new',
        optional(field('type', $.class_or_interface_type)),
        field('dimensions', $.dimensions),
        field('value', $.array_initializer),
      ),
    )),

    dimensions_expr: $ => seq('[', $._expression, ']'),

    block_expression: $ => seq(
      '\\',
      field('parameters', optional($.block_parameter_list)),
      '->',
      field('body', choice($._expression, prec.dynamic(1, $.statement_block))),
    ),

    block_parameter_list: $ => sep1($.parameter, ','),

    initializer_expression: $ => seq('{', optional($._initializer_content), '}'),

    _initializer_content: $ => choice(
      $.map_initializer_list,
      $.array_value_list,
    ),

    array_value_list: $ => commaSep1($._expression),

    map_initializer_list: $ => seq($._map_entry, repeat(seq(',', $._map_entry))),

    _map_entry: $ => seq(field('key', $._expression), '->', field('value', $._expression)),

    array_initializer: $ => seq('{', commaSep($._expression), '}'),

    // ── Literals ─────────────────────────────────────────────────

    _literal: $ => choice(
      $.number_literal,
      $.string_literal,
      $.true,
      $.false,
      $.null_literal,
    ),

    true: _ => 'true',

    false: _ => 'false',

    null_literal: _ => 'null',

    number_literal: _ => token(choice(
      'NaN',
      'Infinity',
      seq(/0[xX]/, HEX_DIGITS, optional(/[lLsS]/)),
      seq(/0[bB]/, /[01]+/, optional(INT_SUFFIX)),
      seq('.', /[0-9]+/, optional(EXPONENT), optional(FLOAT_SUFFIX)),
      seq(
        /[0-9]+/,
        optional(choice(
          seq('.', /[0-9]*/, optional(EXPONENT), optional(FLOAT_SUFFIX)),
          seq(EXPONENT, optional(FLOAT_SUFFIX)),
          FLOAT_SUFFIX,
          INT_SUFFIX,
        )),
      ),
    )),

    string_literal: _ => token(choice(
      seq('"', repeat(choice(ESCAPE_SEQUENCE, /[^"\\]/)), '"'),
      seq("'", repeat(choice(ESCAPE_SEQUENCE, /[^'\\]/)), "'"),
    )),

    // ── Types ────────────────────────────────────────────────────

    _type: $ => choice(
      $._unannotated_type,
      $.intersection_type,
    ),

    intersection_type: $ => prec.dynamic(1, prec.left(seq($._unannotated_type, repeat1(seq('&', $._unannotated_type))))),

    _unannotated_type: $ => choice(
      $.array_type,
      $.class_or_interface_type,
      $.block_type,
    ),

    array_type: $ => prec.dynamic(1, prec.right(seq(
      field('element', choice($.class_or_interface_type, $.block_type)),
      field('dimensions', $.dimensions),
    ))),

    dimensions: $ => prec.right(repeat1(seq('[', ']'))),

    block_type: $ => seq('block', $.block_literal),

    block_literal: $ => choice(
      prec.dynamic(1, seq('(', commaSep($.block_parameter), ')')),
      prec.dynamic(2, seq(
        '(', commaSep($.block_parameter), ')',
        ':', field('return_type', $._type),
      )),
    ),

    block_parameter: $ => choice(
      prec.dynamic(1, seq(field('name', $.identifier), choice(
        seq('=', field('default', $._expression)),
        field('type', $.block_literal),
      ))),
      seq(
        optional(seq(field('name', $.identifier), ':')),
        field('type', $._type),
        optional(seq('=', field('default', $._expression))),
      ),
    ),

    class_or_interface_type: $ => choice(
      $._simple_class_or_interface_type,
      $.scoped_class_or_interface_type,
    ),

    _simple_class_or_interface_type: $ => choice(
      field('name', $.identifier),
      prec.dynamic(1, seq(
        field('name', $.identifier),
        field('type_arguments', $.type_arguments),
      )),
    ),

    scoped_class_or_interface_type: $ => choice(
      prec.dynamic(1, seq(
        field('scope', $.class_or_interface_type),
        '.',
        field('name', $.identifier),
      )),
      prec.dynamic(2, seq(
        field('scope', $.class_or_interface_type),
        '.',
        field('name', $.identifier),
        field('type_arguments', $.type_arguments),
      )),
    ),

    type_arguments: $ => seq('<', commaSep($.type_argument), '>'),

    type_argument: $ => choice(
      $._type,
      seq('?', optional(seq(choice('extends', 'super'), $._type))),
    ),

    // ── Lexical tokens ───────────────────────────────────────────

    identifier: _ => /[A-Za-z_$][A-Za-z_$0-9]*/,

    line_comment: _ => token(seq('//', /[^\r\n]*/)),

    block_comment: _ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 * @returns {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return sep1(rule, ',');
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
