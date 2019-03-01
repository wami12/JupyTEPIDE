def get_json_workspace(workspace_name):
    json_str = """{
        "import": {
            "targetWorkspace": {
                "workspace": {
                    "name": "%s"
                }
            }
        }
    }""" % workspace_name
    return json_str
