import os
import sys


def add_paths():
    module_path1 = os.path.abspath(os.path.join('/opt/var/JupyTEPIDE/sdk'))
    if module_path1 not in sys.path:
        sys.path.append(module_path1)


add_paths()

print("Added script 05-sdk-paths.py")