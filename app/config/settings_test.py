"""Test settings wrapper.

Forces SQLite so pytest stays isolated from the development/production
database configuration.
"""

import os

os.environ["USE_SQLITE_FOR_LOCAL"] = "True"

from .settings import *  # noqa: F401,F403

