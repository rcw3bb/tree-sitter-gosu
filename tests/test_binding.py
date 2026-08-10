"""
Tests for the tree_sitter_gosu native grammar binding.

:author: Ron Webb
:since: 1.0.0
"""

import tree_sitter
import tree_sitter_gosu


def test_can_load_grammar():
    """The compiled Gosu grammar should load into a tree_sitter.Language."""
    language = tree_sitter.Language(tree_sitter_gosu.language())
    assert language is not None


def test_can_parse_simple_class():
    """A minimal Gosu class should parse without errors."""
    language = tree_sitter.Language(tree_sitter_gosu.language())
    parser = tree_sitter.Parser(language)
    source = b"class Foo {\n  function bar(): int {\n    return 1\n  }\n}\n"
    tree = parser.parse(source)
    assert not tree.root_node.has_error
    assert tree.root_node.type == "compilation_unit"
