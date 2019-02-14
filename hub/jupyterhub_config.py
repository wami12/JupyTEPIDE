import logging
import os
import shutil

c = get_config()

# The proxy is in another container
# c.ConfigurableHTTPProxy.should_start = False
# c.ConfigurableHTTPProxy.api_url = 'http://jupytepide-proxy:8001'
# tell the hub to use Dummy Auth (for testing)
# c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
# use SwarmSpawner

# The docker instances need access to the Hub, so the default loopback port doesn't work:
# from jupyter_client.localinterfaces import public_ips
# c.JupyterHub.hub_ip = public_ips()[0]

# OAuth with GitHub
c.JupyterHub.authenticator_class = 'oauthenticator.GitHubOAuthenticator'
c.GitHubOAuthenticator.oauth_callback_url = os.environ['OAUTH_CALLBACK_URL']
c.JupyterHub.admin_access = True

c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
# c.SwarmSpawner.image = os.environ['DOCKER_SPAWN_NOTEBOOK_IMAGE']
c.SwarmSpawner.image = 'jupyter/minimal-notebook:77e10160c7ef'
c.SwarmSpawner.image_whitelist = {
    'Jupyteo All-In-One': 'reg.jupyteo.com/user-spawn-notebook:dev',
    'Jupyteo EO Processing': 'reg.jupyteo.com/eodata-notebook:1.3.6'
}

network_name = os.environ['DOCKER_NETWORK_NAME']
c.SwarmSpawner.network_name = network_name
c.SwarmSpawner.extra_host_config = {'network_mode': network_name}

c.JupyterHub.ip = '0.0.0.0'
c.JupyterHub.hub_ip = '0.0.0.0'
c.DockerSpawner.hub_ip_connect = 'jupyteo-hub'
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

c.JupyterHub.services = [
    {
        'name': 'cull_idle',
        'admin': True,
        'command': 'python /srv/jupyterhub/cull_idle_servers.py --timeout=3600'.split(),
    },
]

notebook_dir = os.environ.get('DOCKER_NOTEBOOK_DIR') or '/home/jovyan'
c.SwarmSpawner.notebook_dir = notebook_dir


def create_dir_hook(spawner):
    username = spawner.user.name  # get the username
    volume_path = os.path.join('/opt/data/priv', username)
    if not os.path.exists(volume_path):
        os.mkdir(volume_path, 0o777)
        os.chmod(volume_path, 0o777)
    conf_path = os.path.join(volume_path, '.jupytepide/conf')
    if not os.path.exists(conf_path):
        os.makedirs(conf_path, exist_ok=True)
        os.chmod(conf_path, 0o777)

    os.environ['SPAWN_USER'] = str(username)
    mounts_user = [{'type': 'bind',
                    'source': '/opt/data/pub/shared',
                    'target': '/home/jovyan/shared', },
                   {'type': 'bind',
                    'source': '/opt/data/priv/' + username,
                    'target': '/home/jovyan/work', },
                   {'type': 'bind',
                    'source': '/opt/data/priv/' + username + '/.jupytepide/conf',
                    'target': '/home/jovyan/.jupytepide/conf', },
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
    gui_path = os.path.join(conf_path, 'gui')
    if not os.path.exists(gui_path):
        os.makedirs(gui_path, exist_ok=True)
        os.chmod(gui_path, 0o777)
        shutil.copy('/opt/var/jupyteo/GUI/jupytepide/code_snippets.json', gui_path)
    os.chmod(os.path.join(gui_path, 'code_snippets.json'), 0o777)


c.Spawner.pre_spawn_hook = create_dir_hook

c.Spawner.mem_limit = '3.0G'
c.Spawner.mem_guarantee = '2.0G'
c.Spawner.cpu_limit = 1.5
c.Spawner.cpu_guarantee = 0.5

# shutdown the server after no activity for an hour
# c.NotebookApp.shutdown_no_activity_timeout = 60 * 60
# shutdown kernels after no activity for 20 minutes
# c.MappingKernelManager.cull_idle_timeout = 20 * 60
# check for idle kernels every two minutes
# c.MappingKernelManager.cull_interval = 2 * 60
