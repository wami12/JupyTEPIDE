from snappy import jpy


class PyHashMap(dict):
    """
    Dictionary that can return Java HashMap object and mimics some HashMap behaviour
    """

    def __init__(self, *args, **kwargs):
        super().__init__(**kwargs)
        self.dict = dict(*args, **kwargs)
        hashmap = jpy.get_type('java.util.HashMap')
        self.params = hashmap()

    def __setitem__(self, key, val):
        """
        Add key/value pair
        """
        dict.__setitem__(self, key, val)
        self.params.put(key, val)

    def clear(self):
        """
        Clear map
        """
        self.dict = {}
        self.params.clear()

    def contains_key(self, key):
        """
        True if key is in map keys false otherwise
        """
        if key in self.keys():
            return True
        else:
            return False

    def contains_value(self, value):
        """
        True if value is in map values false otherwise
        """
        if value in self.values():
            return True
        else:
            return False

    def remove(self, key):
        """
        removes an item
        """
        try:
            del self[key]
            self.params.remove(key)
        except KeyError:
            print("Key", key, "not found")

    def give_hashmap(self):
        """
        returns hashMap
        """
        return self.params
