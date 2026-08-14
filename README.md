# tree-sitter-gosu

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](CHANGELOG.md)

A Tree-sitter grammar that parses Gosu, a statically typed, JVM-based general-purpose programming language.

## Requirements

- Python `>=3.14`
- Poetry `2.2`
- Node.js (for `tree-sitter-cli`, used to regenerate the parser from `grammar.js`)
- A C compiler (MSVC on Windows, GCC/Clang on Linux/macOS) to build the native extension and run
  `tree-sitter test`/`tree-sitter parse`

## Installation

```bash
poetry install
```

## Usage

```python
import tree_sitter
import tree_sitter_gosu

language = tree_sitter.Language(tree_sitter_gosu.language())
parser = tree_sitter.Parser(language)
tree = parser.parse(b"class Foo { function bar(): int { return 1 } }")
```

## Development

### Install dependencies

```bash
poetry install
```

### Run tests with coverage

```bash
poetry run pytest --cov=tree_sitter_gosu tests --cov-report html
```

### Format and lint

```bash
poetry run black tree_sitter_gosu; poetry run pylint tree_sitter_gosu
```

### Regenerate the parser from grammar.js

```bash
npm install
npx tree-sitter generate
npx tree-sitter test
```

## Configuration

Set the `TREE_SITTER_GOSU_CONFIG_DIR` environment variable to override the default configuration directory.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
