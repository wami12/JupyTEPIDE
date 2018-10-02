import logging
import os

c = get_config()

# The proxy is in another container
# c.ConfigurableHTTPProxy.should_start = False
# c.ConfigurableHTTPProxy.api_url = 'http://jupytepide-proxy:8001'
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

c.JupyterHub.hub_ip = '0.0.0.0'
c.DockerSpawner.hub_ip_connect = 'jupytepide-hub'
c.JupyterHub.port = 8000

c.SwarmSpawner.start_timeout = 100
c.SwarmSpawner.http_timeout = 100

c.JupyterHub.cookie_secret_file = 'jupyterhub_cookie_secret'

# debug-logging for testing
c.JupyterHub.log_level = logging.DEBUG

c.SwarmSpawner.image = os.environ['DOCKER_SPAWN_NOTEBOOK_IMAGE']

notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan'
c.SwarmSpawner.notebook_dir = notebook_dir

c.Spawner.mem_limit = '15G'

# Explicitly set notebook directory because we'll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
# notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan/work'
# c.SwarmSpawner.notebook_dir = notebook_dir

# Mount the real user's Docker volume on the host to the notebook user's
# notebook directory in the container
# c.DockerSpawner.volumes = {'jupyterhub-user-{username}': notebook_dir}

mounts = [{'type': 'bind',
           'source': '/opt/pub/shared',
           'target': '/home/jovyan/shared', },
          {'type': 'bind',
           'source': '/eodata-jovyan',
           'target': '/home/jovyan/eodata', },
          {'type': 'bind',
           'source': '/eodata',
           'target': '/eodata', }
          ]

c.SwarmSpawner.extra_container_spec = {
    # Replace mounts with [] to disable permanent storage
    'mounts': mounts
}

c.SwarmSpawner.service_name = 'jupytepide-hub'
# The public facing ip of the whole application (the proxy)
c.JupyterHub.ip = '0.0.0.0'
