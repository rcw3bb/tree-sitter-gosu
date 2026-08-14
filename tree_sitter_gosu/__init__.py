"""
tree_sitter_gosu package.

:author: Ron Webb
:since: 1.0.0
"""

# pylint: disable=duplicate-code
# (pylint compares this __init__.py against the package itself when linting a single-module package)

from importlib.resources import files as _files

from env_dir_bootstrap import EnvDirBootstrap
from logenrich import setup_logger

from ._binding import language  # pylint: disable=import-error,no-name-in-module

__version__ = "0.1.1"

_bootstrapper = EnvDirBootstrap(
    env_var="TREE_SITTER_GOSU_CONFIG_DIR",
    resources=["logging.ini"],
    package="tree_sitter_gosu",
)

_bootstrapper.setup()

CONF_DIR = str(_bootstrapper.get_dir())

setup_logger("tree_sitter_gosu", conf_dir=CONF_DIR)


def _get_query(name, file):
    query = _files(f"{__package__}.queries") / file
    globals()[name] = query.read_text(encoding="utf-8")
    return globals()[name]


def __getattr__(name):
    if name == "HIGHLIGHTS_QUERY":
        return _get_query("HIGHLIGHTS_QUERY", "highlights.scm")
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "language",
    "HIGHLIGHTS_QUERY",  # pylint: disable=undefined-all-variable
]


def __dir__():
    return sorted(__all__)
