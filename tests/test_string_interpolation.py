"""
Tests for string interpolation in the Gosu grammar.

:author: Ron Webb
:since: 0.3.0
"""

from pathlib import Path

import pytest
import tree_sitter
import tree_sitter_gosu

EXAMPLES_DIR = Path(__file__).resolve().parent.parent / "examples"


@pytest.fixture(name="parser")
def parser_fixture() -> tree_sitter.Parser:
    """A parser configured with the Gosu language."""
    return tree_sitter.Parser(tree_sitter.Language(tree_sitter_gosu.language()))


def _parse(parser: tree_sitter.Parser, field_value: bytes) -> tree_sitter.Tree:
    """Parse a class whose only member is a field initialised with the value."""
    return parser.parse(b"class A {\n  var a = " + field_value + b"\n}\n")


def _find(node: tree_sitter.Node, node_type: str) -> list[tree_sitter.Node]:
    """Collect all descendants (including node) of the given type."""
    found = [node] if node.type == node_type else []
    for child in node.children:
        found.extend(_find(child, node_type))
    return found


def test_interpolation_exposes_identifier(parser):
    """`${name}` must produce an interpolation node with an identifier child."""
    tree = _parse(parser, b'"Hello, ${_name}!"')
    assert not tree.root_node.has_error
    (interpolation,) = _find(tree.root_node, "interpolation")
    assert [c.type for c in interpolation.named_children] == ["identifier"]
    assert interpolation.named_children[0].text == b"_name"


def test_interpolation_with_expression_and_nested_string(parser):
    """Interpolations contain real expressions, including nested strings."""
    tree = _parse(parser, b'"x ${ p.name.concat("y ${z}") }"')
    assert not tree.root_node.has_error
    assert len(_find(tree.root_node, "interpolation")) == 2
    assert len(_find(tree.root_node, "member_access")) == 2


def test_escape_sequences_and_lone_dollar(parser):
    """Escapes become nodes and `$` not followed by `{` stays plain text."""
    tree = _parse(parser, b'"\\$x \\n $y $"')
    assert not tree.root_node.has_error
    assert len(_find(tree.root_node, "escape_sequence")) == 2
    assert not _find(tree.root_node, "interpolation")
    assert len(_find(tree.root_node, "identifier")) == 2


def test_single_quoted_string_is_opaque(parser):
    """Single-quoted strings are never interpolated."""
    tree = _parse(parser, b"'no ${interp}'")
    assert not tree.root_node.has_error
    (literal,) = _find(tree.root_node, "string_literal")
    assert literal.child_count == 0


@pytest.mark.parametrize("name", ["Sample.gs", "Annotated.gs"])
def test_examples_parse_with_interpolation(parser, name):
    """Example files using interpolation parse without errors."""
    tree = parser.parse((EXAMPLES_DIR / name).read_bytes())
    assert not tree.root_node.has_error
    assert _find(tree.root_node, "interpolation")
