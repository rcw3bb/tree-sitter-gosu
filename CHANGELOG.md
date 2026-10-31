# Changelog

## 0.3.0 - 2026-10-31

### Added

- Decompose `${...}` interpolations in double-quoted strings into real `interpolation` nodes whose children are regular expressions (e.g. `identifier`), instead of one opaque `string_literal` token.
- New `string_content` and `escape_sequence` nodes inside double-quoted `string_literal`.
- Highlight captures for `escape_sequence` and the `${`/`}` interpolation delimiters.

### Changed

- Double-quoted `string_literal` nodes now have children; single-quoted strings remain a single token and are never interpolated.
- Renamed the Poetry build script to `_poetry_build.py` to avoid shadowing the PyPA `build` package.

## 0.2.1 - 2026-10-02

### Added

- Support feature literals without an explicit object.
- Add syntax highlighting for the `reified` keyword.

## 0.2.0 - 2026-08-14

### Added

- Support for `reified` modifier for type parameters in generic declarations (as per Gosu language specification).

### Changed

- Removed `EnvDirBootstrap` usage since tree-sitter-gosu is a library, not a standalone application.
- Simplified logger initialization by removing the `conf_dir` parameter from `setup_logger()`.
- Removed `env-dir-bootstrap` dependency from project dependencies.

## 0.1.2 - 2026-08-14

### Changed

- Bumped version to `0.1.2` for publish testing.

## 0.1.1 - 2026-08-14

### Changed

- Bumped version to `0.1.1` for publish testing.

## 0.1.0 - 2026-08-14

### Added

- Initial release of tree-sitter-gosu.
- Full Gosu `grammar.js` for tree-sitter, translated from the ANTLR grammar in `gosu-lsp`, covering declarations
  (package/uses/class/interface/enum/enhancement/delegate), statements, the full expression precedence chain,
  types, and literals.
- `npx tree-sitter generate` toolchain wiring (`package.json`, `tree-sitter.json`, `tree-sitter-cli` devDependency).
- Python native bindings: `tree_sitter_gosu.language()`, `tree_sitter_gosu.HIGHLIGHTS_QUERY`, compiled via
  `bindings/python/binding.c` and a Poetry `build.py` script hook.
- `queries/highlights.scm` for editor syntax highlighting.
- `tests/test_binding.py` covering grammar loading and a basic parse smoke test.
- Logging support via `logenrich`.
- Configuration directory bootstrapping via `env-dir-bootstrap`.

### Known limitations

- Building the native extension and running `tree-sitter test`/`parse` requires a C compiler (MSVC on Windows).
  This was not available in the environment that authored this release — install Visual Studio Build Tools
  ("Desktop development with C++") and re-run `poetry install` / `npx tree-sitter generate` to verify.
- Generic type witnesses on member access (e.g. `a.<T>b(...)`) are not supported, to avoid a generics-vs-`<`
  parsing ambiguity.
