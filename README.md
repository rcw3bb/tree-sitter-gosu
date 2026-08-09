# tree-sitter-gosu

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)

A Tree-sitter grammar that parses Gosu, a statically typed, JVM-based general-purpose programming language.

## Requirements

- Python `>=3.14`
- Poetry `2.2`

## Installation

```bash
poetry install
```

## Usage

```python
import tree_sitter_gosu
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

## Configuration

Set the `TREE_SITTER_GOSU_CONFIG_DIR` environment variable to override the default configuration directory.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
