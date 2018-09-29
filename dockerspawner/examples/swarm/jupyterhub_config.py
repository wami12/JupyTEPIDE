import logging
import os

c = get_config()

# The proxy is in another container
c.ConfigurableHTTPProxy.should_start = False
c.ConfigurableHTTPProxy.api_url = 'http://jupytepide-proxy:8001'
# tell the hub to use Dummy Auth (for testing)
c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
# use SwarmSpawner
c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
# The Hub should listen on all interfaces,
# so user servers can connect
# c.JupyterHub.hub_ip = '0.0.0.0'

# c.SwarmSpawner.use_internal_ip = True

network_name = os.environ['DOCKER_NETWORK_NAME']
c.SwarmSpawner.network_name = network_name
c.SwarmSpawner.extra_host_config = {'network_mode': network_name}
# c.SwarmSpawner.extra_start_kwargs = {'network_mode': network_name}

# c.JupyterHub.ip = '0.0.0.0'
c.JupyterHub.hub_ip = '0.0.0.0'
# c.DockerSpawner.host_ip = "0.0.0.0"
c.DockerSpawner.hub_ip_connect = 'jupytepide-hub'
# c.DockerSpawner.container_ip = "0.0.0.0"
c.JupyterHub.port = 8000

c.SwarmSpawner.start_timeout = 100
c.SwarmSpawner.http_timeout = 100

c.JupyterHub.cookie_secret_file = 'jupyterhub_cookie_secret'

# debug-logging for testing
c.JupyterHub.log_level = logging.DEBUG

c.SwarmSpawner.image = os.environ['DOCKER_SPAWN_NOTEBOOK_IMAGE']
# c.DockerSpawner.image = 'jupyter/minimal-notebook:30f16d52126f'
# c.DockerSpawner.image = 'jupyter/minimal-notebook:8ccdfc1da8d5'
# c.DockerSpawner.image = 'jupytepide/base-scipy-r-notebook:1.3.0-dev'
# c.DockerSpawner.image = 'jupyter/scipy-notebook:8ccdfc1da8d5'
# c.DockerSpawner.image = 'jupyter/scipy-notebook:177037d09150'

# notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan'
# c.SwarmSpawner.notebook_dir = notebook_dir
#
# c.Spawner.mem_limit = '10G'

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
#            'target': '/home/jovyan/work', }]
# #
# c.SwarmSpawner.extra_container_spec = {
#     # Replace mounts with [] to disable permanent storage
#     'mounts': mounts
# }
