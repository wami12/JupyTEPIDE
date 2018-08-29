from shutil import copyfile


def replace_result(sourcefile, dest='/home/jovyan/results/results.tif'):
    copyfile(sourcefile, dest)


print("Added script 06-auxiliary_functions.py")
