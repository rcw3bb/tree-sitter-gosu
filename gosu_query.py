"""
Interactive Gosu tree-sitter explorer.

Usage:
    # Parse a string passed directly
    poetry run python gosu_query.py --code 'class Foo { function bar(): int { return 1 } }'

    # Parse a .gs file
    poetry run python gosu_query.py --file path/to/MyClass.gs

    # Run a tree-sitter S-expression query after parsing
    poetry run python gosu_query.py --file path/to/MyClass.gs --query '(function_declaration name: (identifier) @fn)'

    # Print the full syntax tree (always shown unless --quiet)
    poetry run python gosu_query.py --code '...' --tree

:author: Ron Webb
:since: 1.0.0
"""

import argparse
import sys

import tree_sitter
import tree_sitter_gosu


def _build_parser() -> tree_sitter.Parser:
    return tree_sitter.Parser(tree_sitter.Language(tree_sitter_gosu.language()))


def _print_tree(node: tree_sitter.Node, source: bytes, indent: int = 0) -> None:
    prefix = "  " * indent
    snippet = source[node.start_byte : node.end_byte].decode(errors="replace")
    # truncate long literals for readability
    if len(snippet) > 60:
        snippet = snippet[:57] + "..."
    print(f"{prefix}[{node.type}] {snippet!r}  ({node.start_point} – {node.end_point})")
    for child in node.children:
        _print_tree(child, source, indent + 1)


def _run_query(
    language: tree_sitter.Language,
    root: tree_sitter.Node,
    source: bytes,
    pattern: str,
) -> None:
    try:
        query = tree_sitter.Query(language, pattern)
    except tree_sitter.QueryError as exc:
        print(f"Query error: {exc}", file=sys.stderr)
        sys.exit(1)

    captures: dict[str, list[tree_sitter.Node]] = tree_sitter.QueryCursor(query).captures(root)
    if not captures:
        print("No captures matched.")
        return

    for capture_name, nodes in captures.items():
        for node in nodes:
            text = source[node.start_byte : node.end_byte].decode(errors="replace")
            print(f"@{capture_name}  [{node.type}]  {node.start_point}  {text!r}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Parse Gosu source and query its syntax tree.")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--code", metavar="GOSU", help="Inline Gosu source code string.")
    src.add_argument("--file", metavar="PATH", help="Path to a .gs file.")
    ap.add_argument("--query", metavar="SEXP", help="Tree-sitter S-expression query to run.")
    ap.add_argument(
        "--tree",
        action="store_true",
        default=False,
        help="Print the full syntax tree (always printed when --query is omitted).",
    )
    args = ap.parse_args()

    if args.file:
        with open(args.file, "rb") as fh:
            source = fh.read()
    else:
        source = args.code.encode()

    parser = _build_parser()
    tree = parser.parse(source)
    root = tree.root_node

    print(f"Root node : {root.type}")
    print(f"Has errors: {root.has_error}")
    print()

    show_tree = args.tree or args.query is None
    if show_tree:
        print("=== Syntax Tree ===")
        _print_tree(root, source)
        print()

    if args.query:
        lang = tree_sitter.Language(tree_sitter_gosu.language())
        print("=== Query Results ===")
        _run_query(lang, root, source, args.query)


if __name__ == "__main__":
    main()
