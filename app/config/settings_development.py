"""Development settings wrapper.

We keep the current `config.settings` module as the shared base and expose a
dedicated development entrypoint so production can switch settings cleanly.
"""

from .settings import *  # noqa: F401,F403

DEBUG = True

