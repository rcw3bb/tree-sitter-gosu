"""Poetry build script: compiles the tree-sitter Gosu native extension in-place.

:author: Ron Webb
:since: 1.0.0
"""

from platform import system

from setuptools import Extension
from setuptools.command.build_ext import build_ext
from setuptools.dist import Distribution


def build():
    """Compile the ``tree_sitter_gosu._binding`` native extension in-place."""
    extra_compile_args = (
        ["-std=c11", "-fvisibility=hidden"]
        if system() != "Windows"
        else ["/std:c11", "/utf-8"]
    )
    extension = Extension(
        name="tree_sitter_gosu._binding",
        sources=[
            "bindings/python/binding.c",
            "src/parser.c",
        ],
        extra_compile_args=extra_compile_args,
        define_macros=[
            ("PY_SSIZE_T_CLEAN", None),
            ("TREE_SITTER_HIDE_SYMBOLS", None),
        ],
        include_dirs=["src"],
    )
    dist = Distribution({"ext_modules": [extension]})
    cmd = build_ext(dist)
    cmd.inplace = 1
    cmd.ensure_finalized()
    cmd.run()


if __name__ == "__main__":
    build()
