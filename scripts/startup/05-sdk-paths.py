import os
import sys


def add_paths():
    module_path1 = os.path.abspath(os.path.join('/opt/JupyTEPIDE/sdk'))
    if module_path1 not in sys.path:
        sys.path.append(module_path1)

    module_path2 = os.path.abspath(os.path.join('/opt/JupyTEPIDE/sdk/maps/geoserver'))
    if module_path2 not in sys.path:
        sys.path.append(module_path2)


add_paths()

print("Added script 05-sdk-paths.py")
