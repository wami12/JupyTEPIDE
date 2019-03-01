# Jupyteo
Jupyteo is an extension for Jupyter. It is an IDE for spatial data processing.<br>
----------------------------------------<br>
<br>
## Instalation
### To install manually: <br>
Place the "jupyteo" directory into your server's extension dir. For example <local user>:<br>
/home/user/.local/share/jupyter/nbextensions<br>
<br>
To enable - in file: <br>
/home/user/.jupyter/nbconfig/notebook.json <br>
one should have:<br>
```
{
  "load_extensions": {
    "jupyteo/main": true
  }
}
```

### Automatic installation<br>
```
jupyter nbextension install jupyteo/main --user
```
then, enable it by:<br>
```
jupyter nbextension enable jupyteo/main --sys-prefix
```



