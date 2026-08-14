# Changelog

## 0.2.0 - 2026-08-14

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
