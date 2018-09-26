import logging

c = get_config()

# The proxy is in another container
c.DockerSpawner.use_internal_ip = True
c.ConfigurableHTTPProxy.should_start = False
c.ConfigurableHTTPProxy.api_url = 'http://proxy:8001'
# tell the hub to use Dummy Auth (for testing)
c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
# use SwarmSpawner
c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
# The Hub should listen on all interfaces,
# so user servers can connect
# c.JupyterHub.hub_ip = '0.0.0.0'
# this is the name of the 'service' in docker-compose.yml
# c.JupyterHub.hub_connect_ip = 'jupytepide-hub'
# The public facing port of the proxy
c.JupyterHub.port = 8000
# The ip for this process
c.JupyterHub.hub_ip = 'jupytepide-hub'
# this is the network name for jupyterhub in docker-compose.yml
# with a leading 'swarm_' that docker-compose adds
c.SwarmSpawner.network_name = 'jupytepide-swarm-net'
c.DockerSpawner.extra_host_config = {'network_mode': 'jupytepide-swarm-net'}
c.DockerSpawner.extra_start_kwargs = {'network_mode': 'jupytepide-swarm-net'}

c.DockerSpawner.hub_ip_connect = 'jupytepide-hub'
# c.JupyterHub.hub_ip = '192.168.0.9'
c.DockerSpawner.container_ip = "0.0.0.0"

c.Spawner.start_timeout = 200
c.Spawner.http_timeout = 200

c.JupyterHub.cookie_secret_file = 'jupyterhub_cookie_secret'

# start jupyterlab
# c.Spawner.cmd = ["jupyter", "labhub"]

# debug-logging for testing
c.JupyterHub.log_level = logging.DEBUG

c.DockerSpawner.image = 'jupyter/minimal-notebook:30f16d52126f'

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
