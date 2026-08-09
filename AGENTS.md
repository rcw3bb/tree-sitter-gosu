## Purpose

This repo is a Python library (`tree-sitter-gosu`) that provides a Tree-sitter grammar for parsing Gosu, a statically typed, JVM-based general-purpose programming language. It bootstraps configuration and logging via `env-dir-bootstrap` and `logenrich`. Requires Python >=3.14 and Poetry 2.2.

- Install: `poetry install`
- Test: `poetry run pytest --cov=tree_sitter_gosu tests --cov-report html`
- Lint/Format: `poetry run black tree_sitter_gosu; poetry run pylint tree_sitter_gosu`
- Override config dir: `TREE_SITTER_GOSU_CONFIG_DIR` environment variable

## Tree

- `tree_sitter_gosu/` — main package source
- `tree_sitter_gosu/__init__.py` — package entry point; bootstraps env dir and logging
- `tree_sitter_gosu/logging.ini` — logging configuration (included in distribution)
- `tests/` — pytest tests mirroring the package structure
- `pyproject.toml` — project metadata, dependencies, and build config (Poetry)
- `CHANGELOG.md` — version history
- `README.md` — project overview and usage
- `LICENSE` — MIT license

## Rules

- Always use `poetry run` to execute Python tools (pytest, black, pylint); never call them directly.
- Always use `poetry add` / `poetry remove` to manage dependencies; never edit `pyproject.toml` dependency lists by hand.
- Mirror `tree_sitter_gosu/` structure when adding new test files under `tests/`.
- Never modify `logging.ini` format without verifying it still satisfies `logenrich` expectations.
- Use `from logenrich import setup_logger` for logging — never configure the standard `logging` module directly.
- Never change `TREE_SITTER_GOSU_CONFIG_DIR` bootstrap logic in `__init__.py` without my approval.
- Follow SOLID: each module has a single responsibility; depend on abstractions, not concretions.
- Follow DRY: extract shared logic into utilities; never duplicate parsing or bootstrap logic.
- Prefer composition over inheritance when extending grammar behavior.
- Use modern Python syntax (>=3.14): match statements, walrus operator, type hints, f-strings.
- When you create or discover new files, update the Tree section above.
- Before bumping the version, update `__version__` in `tree_sitter_gosu/__init__.py`, update the `version` field in `pyproject.toml`, and add a CHANGELOG.md entry. The README.md version badge MUST be updated accordingly.

## Note-taking

- After each task, log any correction, preference, or pattern learned.
- Write to the matching context file's "Session learnings" section; if none fits, add to Rules above. One dated line, plain language.
  e.g. `"Grammar node types are defined in grammar.js, not in Python (learned 8/9)"`
- 3+ related notes on a topic → create a new `docs/` context file, move notes there, update the Tree. Keep this file under 100 lines.
