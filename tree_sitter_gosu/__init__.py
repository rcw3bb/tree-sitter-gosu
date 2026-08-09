"""
tree_sitter_gosu package.

:author: Ron Webb
:since: 1.0.0
"""

from env_dir_bootstrap import EnvDirBootstrap
from logenrich import setup_logger

__version__ = "1.0.0"

_bootstrapper = EnvDirBootstrap(
    env_var="TREE_SITTER_GOSU_CONFIG_DIR",
    resources=["logging.ini"],
    package="tree_sitter_gosu",
)

_bootstrapper.setup()

CONF_DIR = str(_bootstrapper.get_dir())

setup_logger("tree_sitter_gosu", conf_dir=CONF_DIR)
