import logging
import os

c = get_config()

# The proxy is in another container
c.ConfigurableHTTPProxy.should_start = False
c.ConfigurableHTTPProxy.api_url = 'http://proxy:8001'
# tell the hub to use Dummy Auth (for testing)
c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
# use SwarmSpawner
c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
# The Hub should listen on all interfaces,
# so user servers can connect
# c.JupyterHub.hub_ip = '0.0.0.0'

c.DockerSpawner.use_internal_ip = True

c.SwarmSpawner.network_name = 'jupytepide-swarm-net'
c.DockerSpawner.extra_host_config = {'network_mode': 'jupytepide-swarm-net'}
c.DockerSpawner.extra_start_kwargs = {'network_mode': 'jupytepide-swarm-net'}

c.JupyterHub.hub_ip = 'jupytepide-hub'
c.DockerSpawner.hub_ip_connect = 'jupytepide-hub'
c.DockerSpawner.container_ip = "0.0.0.0"

c.JupyterHub.port = 8000

c.Spawner.start_timeout = 200
c.Spawner.http_timeout = 200

c.JupyterHub.cookie_secret_file = 'jupyterhub_cookie_secret'

# debug-logging for testing
c.JupyterHub.log_level = logging.DEBUG

c.DockerSpawner.image = 'jupytepide/eodata-notebook:latest'

notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan/work'
c.DockerSpawner.notebook_dir = notebook_dir


# Explicitly set notebook directory because we'll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
# notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan/work'
# c.SwarmSpawner.notebook_dir = notebook_dir

# Mount the real user's Docker volume on the host to the notebook user's
# notebook directory in the container
# c.DockerSpawner.volumes = {'jupyterhub-user-{username}': notebook_dir}

# mounts = [{'type': 'bind',
#            'source': '/var/hostdir',
#            'target': notebook_dir, }]
#
# c.SwarmSpawner.container_spec = {
#     # The command to run inside the service
#     'args': ['/usr/local/bin/start-singleuser.sh'],  # (string or list)
#     'Image': 'jupytepide/stack-notebook:latest',
#     # Replace mounts with [] to disable permanent storage
#     'mounts': mounts
# }
