"""pytest config for dockerspawner tests"""

from unittest import mock

import pytest
from docker import from_env as docker_from_env
# import base jupyterhub fixtures
from dockerspawner import DockerSpawner
from jupyterhub.tests.mocking import MockHub

# make Hub connectable from docker by default
MockHub.hub_ip = "0.0.0.0"


@pytest.fixture
def dockerspawner(app):
    """Configure JupyterHub to use DockerSpawner"""
    app.config.DockerSpawner.prefix = "dockerspawner-test"
    # app.config.DockerSpawner.remove = True
    with mock.patch.dict(app.tornado_settings, {"spawner_class": DockerSpawner}):
        yield


@pytest.fixture(autouse=True, scope="session")
def docker():
    """Fixture to return a connected docker client

    cleans up any containers we leave in docker
    """
    d = docker_from_env()
    try:
        yield d

    finally:
        # cleanup our containers
        for c in d.containers.list(all=True):
            if c.name.startswith("dockerspawner-test"):
                c.stop()
                c.remove()

        for c in d.services.list():
            if c.name.startswith("dockerspawner-test"):
                c.remove()
