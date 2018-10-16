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

network_name = os.environ['DOCKER_NETWORK_NAME']
c.SwarmSpawner.network_name = network_name
c.SwarmSpawner.extra_host_config = {'network_mode': network_name}
# c.SwarmSpawner.extra_start_kwargs = {'network_mode': network_name}

# The Hub should listen on all interfaces,
# so user servers can connect
# The public facing ip of the whole application (the proxy)
c.JupyterHub.ip = '0.0.0.0'
c.JupyterHub.hub_ip = '0.0.0.0'
c.DockerSpawner.hub_ip_connect = 'jupytepide-hub'
c.JupyterHub.port = 8000

c.SwarmSpawner.start_timeout = 100
c.SwarmSpawner.http_timeout = 100

c.JupyterHub.cookie_secret_file = 'jupyterhub_cookie_secret'

# debug-logging for testing
c.JupyterHub.log_level = logging.DEBUG
# Enable debug-logging of the single-user server
c.Spawner.debug = True
# Enable debug-logging of the single-user server
c.LocalProcessSpawner.debug = True

c.SwarmSpawner.image = os.environ['DOCKER_SPAWN_NOTEBOOK_IMAGE']

notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan'
c.SwarmSpawner.notebook_dir = notebook_dir


# Explicitly set notebook directory because we'll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
# notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan/work'
# c.SwarmSpawner.notebook_dir = notebook_dir

# Mount the real user's Docker volume on the host to the notebook user's
# notebook directory in the container
# c.DockerSpawner.volumes = {'/opt/data/priv/jupyterhub-user-{username}': {'bind': '/home/jovyan/work', 'mode': 'ro'}, }


def create_dir_hook(spawner):
    username = spawner.user.name  # get the username
    volume_path = os.path.join('/opt/data/priv', username)
    if not os.path.exists(volume_path):
        os.mkdir(volume_path, 0o777)
        os.chmod(volume_path, 0o777)

    os.environ['SPAWN_USER'] = str(username)
    mounts_user = [{'type': 'bind',
                    'source': '/opt/data/pub/shared',
                    'target': '/home/jovyan/shared', },
                   {'type': 'bind',
                    'source': '/opt/data/priv/' + username,
                    'target': '/home/jovyan/work', },
                   {'type': 'bind',
                    'source': '/eodata-jovyan',
                    'target': '/home/jovyan/eodata', },
                   {'type': 'bind',
                    'source': '/eodata',
                    'target': '/eodata', },
                   {'type': 'bind',
                    'source': '/opt/var',
                    'target': '/opt/var', }
                   ]
    spawner.extra_container_spec = {
        'mounts': mounts_user
    }


# attach the hook function to the spawner
c.Spawner.pre_spawn_hook = create_dir_hook
# c.SwarmSpawner.extra_container_spec = {
#     # Replace mounts with [] to disable permanent storage
#     'mounts': mounts
# }

c.Spawner.mem_limit = '4G'
c.Spawner.cpu_limit = 2.0
c.Spawner.cpu_guarantee = 1.0

# shutdown the server after no activity for an hour
c.NotebookApp.shutdown_no_activity_timeout = 60 * 60
# shutdown kernels after no activity for 20 minutes
c.MappingKernelManager.cull_idle_timeout = 20 * 60
# check for idle kernels every two minutes
c.MappingKernelManager.cull_interval = 2 * 60
