import json
from typing import List

from uime import ui_enabled, start_server, ui_global

DEFAULT = "There are no accidents."
DEFAULT_2 = "Only coincidences."


@ui_global(name="DEFAULT", description="Global DEFAULT value", default_value=DEFAULT)
def set_default(value):
    global DEFAULT
    DEFAULT = value


@ui_global(name="DEFAULT_2", description="Global DEFAULT_2 value", default_value=DEFAULT_2)
def set_default2(value):
    global DEFAULT_2
    DEFAULT_2 = value


@ui_enabled(group="group1")
def hello_world(name, value: bool = True):
    return f"Hello {name}. {DEFAULT} {DEFAULT_2} | {value}"


@ui_enabled(group="group1", title="My API", description="This will return a json")
def make_api_call(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})


@ui_enabled(group="group2")
def sum_math_function(a: int, b: int):
    return a + b


@ui_enabled(group="group2")
def difference_math_function(a: int, b: int = 22):
    print(type(b))
    return a - b


@ui_enabled(group="group1")
def test_list_string(regular_list: list,
                     bool_data: bool,
                     strings: List[str], ints: List[int], dicts: dict, list_of_list: List[list],
                     list_with_default:list = "more,default"):
    return f"""
    list = {regular_list},
    bool_data: {bool_data}
    strings= {strings}
    ints= {ints}
    dicts: {json.dumps(dicts)}
    list_of_list: {list_of_list},
    list_with_default: {list_with_default}
    """


if __name__ == '__main__':
    start_server(port=5001)
