# Tree-sitter grammar & build tooling notes

Context for maintaining `grammar.js`, the tree-sitter toolchain, and the Poetry-based native extension build.

## Grammar authoring (ANTLR → tree-sitter translation)

- The Gosu grammar was translated from the ANTLR file at
  `../gosu-lsp/server/src/main/antlr/xyz/ronella/gosu/lsp/GosuLanguage.g4`. Re-check that file when extending
  the grammar so tree-sitter stays faithful to the language's actual syntax.
- Generic type witnesses on member access (`a.<T>b(...)`) are intentionally NOT supported in `grammar.js` — they
  caused an unavoidable ambiguity with the `<` relational operator. If this is needed later, it requires careful
  `prec.dynamic` + `conflicts` work similar to the `class_or_interface_type` generics handling already in the file.
- `member_access`/`feature_literal` never fuse call arguments themselves; every invocation is represented via a
  separate generic `call_expression` node wrapping the accessed value (avoids an ambiguity with fused method calls).

## Tree-sitter conflict resolution recipe (learned 8/10)

- Whenever `npx tree-sitter generate` reports `Unresolved conflict ... Add a conflict for these rules: X` (a single
  rule), the fix is: split the ambiguous optional/repeat into two explicit alternatives, wrap the "greedier"
  alternative in `prec.dynamic(1, ...)`, then add a self-conflict entry `[$.X]` to the `conflicts` array.
  `prec.dynamic` alone does NOT silence the generate-time error — the `conflicts` array entry is what permits GLR
  to merge the branches instead of erroring; dynamic precedence then decides the winner at parse time.
- If it reports a pair `X, Y`, one of them should just always win (e.g. `class_body` over `initializer_expression`
  for an empty `{}`) — wrap the preferred one in `prec.dynamic(1, ...)` and add `[$.X, $.Y]` to conflicts.
- Recurring ambiguity classes hit in this grammar: generics `<T>` vs relational `<`/`>`; intersection types `A & B`
  vs bitwise-and; array-type `T[]` vs index access `expr[i]`; empty `{}` meaning class body vs array/map literal
  vs statement block; a statement's own optional trailing `;` vs `_statement`'s bare `';'` alternative (fix: remove
  the redundant per-rule `;`, don't try to out-precedence it).
- A rule (other than the grammar's start rule) must never be able to match the empty string — `modifiers` had to be
  `repeat1(...)` with `optional($.modifiers)` at every call site, not `repeat(...)` used directly.

## Toolchain / environment

- On Windows, `tree-sitter generate` does NOT need a C compiler, but `tree-sitter parse`/`tree-sitter test` DO
  (they compile `parser.c` via `cl.exe`). Check `where cl.exe` and vswhere's `VC.Tools` component before assuming
  either works.
- Installing VS Build Tools via `winget install --id Microsoft.VisualStudio.2022.BuildTools --silent` failed with
  exit code 1602 (needs interactive UAC elevation) — this must be done by the user interactively, not scripted.

## Poetry + native extension build (learned 8/10)

- `[tool.poetry] build = "build.py"` is invalid; the correct key is the nested table `[tool.poetry.build]` with
  `script = "build.py"`.
- poetry-core does NOT support the old `def build(setup_kwargs): ...` convention (mutating a setuptools kwargs
  dict) — it silently no-ops. `build.py` must compile the extension itself in-place using
  `setuptools.command.build_ext.build_ext(dist)` with `cmd.inplace = 1; cmd.ensure_finalized(); cmd.run()` (NOT
  `dist.parse_command_line()` + `dist.run_command(...)`, which fails with "no commands supplied").
- `build-system.requires` must list `setuptools` explicitly — Poetry builds in a bare temp venv with nothing
  preinstalled.
- `[tool.poetry] include` needs explicit `{path=..., format="wheel"}` entries for the compiled `_binding*.pyd`/
  `_binding*.so` outputs, and `{path=..., format="sdist"}` for the C sources so sdist can rebuild from source.
- Don't keep a parallel `setup.py` next to `build.py` — poetry-core never invokes `setup.py`, so it becomes
  dead/duplicated code.

## Session learnings

(Notes will be added here as the AI learns from each task.)
