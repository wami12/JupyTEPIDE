import os

c = get_config()

c.JupyterHub.authenticator_class = 'oauthenticator.GitHubOAuthenticator'
c.GitHubOAuthenticator.oauth_callback_url = 'http://185.48.235.7:8000/hub/oauth_callback'
c.GitHubOAuthenticator.client_id = 'b72e40ee67ccbe92b05a'
c.GitHubOAuthenticator.client_secret = 'd0e0d4f5b0ad3670a8bba5e3654295083245abd5'

# c.JupyterHub.authenticator_class = GoogleOAuthenticator
# c.GoogleOAuthenticator.oauth_callback_url = 'http://185.48.235.7/hub/oauth_callback'
# c.GoogleOAuthenticator.client_id = ''
# c.GoogleOAuthenticator.client_secret = ''

# The public facing port of the proxy
c.JupyterHub.port = 8000
# The public facing ip of the whole application (the proxy)
c.JupyterHub.ip = '0.0.0.0'
# The ip for this process
c.JupyterHub.hub_ip = '0.0.0.0'
#  Defaults to an empty set, in which case no user has admin access.
c.GoogleOAuthenticator.admin_users = {"zinkiewicz.daniel@gmail.com"}

c.Spawner.start_timeout = 300
c.Spawner.http_timeout = 300
# c.SwarmSpawner.start_timeout = 60 * 5

# To use user_options in service creation
c.SwarmSpawner.use_user_options = False

c.JupyterHub.spawner_class = 'cassinyspawner.SwarmSpawner'
c.SwarmSpawner.jupyterhub_service_name = "jupyterhubserver"
c.SwarmSpawner.service_prefix = "jupytep"

c.SwarmSpawner.networks = ["jupyterhub"]

notebook_dir = os.environ.get('NOTEBOOK_DIR') or '/home/jovyan/work'
c.SwarmSpawner.notebook_dir = notebook_dir

# mounts = [{'type': 'volume',
#            'source': 'jupyterhub-user-{username}',
#            'target': notebook_dir,
#            'no_copy': True,
#            'driver_config': {
#                'name': 'local',
#                'options': {
#                    'type': 'nfs4',
#                    'o': 'addr=192.168.0.13",rw',
#                    'device': ':/var/nfs/{username}/'
#                }
#            },
#            }]

mounts = [{'type': 'bind',
           'source': '/var/hostdir',
           'target': notebook_dir, }]

# mounts = [{'type': 'volume',
#            'source': 'jupyterhub-user-{username}',
#            'target': notebook_dir, }]

# mounts = [{'type': 'volume',
#            'source': '',
#            'target': notebook_dir, }]

# mounts = []

c.SwarmSpawner.container_spec = {
    # The command to run inside the service
    'args': ['/usr/local/bin/start-singleuser.sh'],  # (string or list)
    'Image': 'jupyter/minimal-notebook:latest',
    # Replace mounts with [] to disable permanent storage
    'mounts': mounts
}

c.SwarmSpawner.resource_spec = {
    # (int)  CPU limit in units of 10^9 CPU shares.
    'cpu_limit': int(1 * 1e9),
    # (int)  Memory limit in Bytes.
    'mem_limit': int(2048 * 1e6),
    # (int)  CPU reservation in units of 10^9 CPU shares.
    'cpu_reservation': int(1 * 1e9),
    # (int)  Memory reservation in bytes
    'mem_reservation': int(2048 * 1e6),
}
