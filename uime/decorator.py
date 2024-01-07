# Copyright 2023. Tushar Naik
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import inspect
import json
from collections import defaultdict


def handle_noop(value, default):
    return value


def handle_bool(value, default):
    """
    This is a hack: checkboxes in forms (being used for bool) don't get included if unchecked. Also, the value
    is 'on' or nothing. This handles the drawback of forms by explicitly checking across all parameters, if there is a bool, and sets the value
    :param value:
    :param default:
    :return:
    """
    if value in ["on", "true"]:
        return True
    return False


def handle_list_of_string(value, default):
    """
    assuming that the input is from a textbox, this function will try to extract a list of string from the input.
    The priority of extraction is as follows:
    1. Newline
    2. Comma
    3. Space

    Priority: newline is checked first, if available, the string will be split by newline and returned as a list.
    Then there is a check for comma, if available, the string will be split by comma and returned as a list.
    Finally space.
    """
    if value is None:
        return default
    if '\n' in value:
        return str(value).split("\n")
    elif ',' in value:
        return str(value).split(",")
    elif ' ' in value:
        return str(value).split(" ")
    return [str(value)]


def handle_set_of_string(value, default):
    return set(handle_list_of_string(value, default))


def handle_list_of_int(value, default):
    if value is None:
        return default
    if '\n' in value:
        return [int(x) for x in str(value).split("\n")]
    elif ',' in value:
        return [int(x) for x in str(value).split(",")]
    return [int(value)]


def handle_list_of_float(value, default):
    if value is None:
        return default
    if '\n' in value:
        return [float(x) for x in str(value).split("\n")]
    elif ',' in value:
        return [float(x) for x in str(value).split(",")]
    elif ' ' in value:
        return [float(x) for x in str(value).split(" ")]
    return [float(value)]


def handle_list_of_complex(value, default):
    if value is None:
        return default
    if '\n' in value:
        return [complex(x) for x in str(value).split("\n")]
    elif ',' in value:
        return [complex(x) for x in str(value).split(",")]
    elif ' ' in value:
        return [complex(x) for x in str(value).split(" ")]
    return [complex(value)]


def handle_float(value, default):
    try:
        return float(value)
    except ValueError:
        return default


def handle_complex(value, default):
    try:
        return complex(value)
    except ValueError:
        return default


def handle_int(value, default):
    try:
        return int(value)
    except:
        return default


def handle_list_of_list(value, default):
    if value is None:
        return default
    if '\n' in value:
        return [handle_list_of_string(x, x) for x in str(value).split("\n")]

    return [[str(value)]]


def handle_dict(value, default):
    if value is None:
        return default
    return json.loads(value)


type_handler_registry = {
    'int': handle_int,
    'float': handle_float,
    'complex': handle_float,
    'list': handle_list_of_string,
    'set': handle_set_of_string,
    'tuple': handle_list_of_string,
    'List[str]': handle_list_of_string,
    'List[int]': handle_list_of_int,
    'List[float]': handle_list_of_float,
    'List[complex]': handle_list_of_complex,
    'List[list]': handle_list_of_list,
    'dict': handle_dict,
    'bool': handle_bool
}


def type_handler(type):
    if type in type_handler_registry:
        return type_handler_registry[type]
    return handle_noop


class ParameterInfo:
    def __init__(self, name, type_annotation, default_value, type_handler):
        self.name = name
        self.type = type_annotation
        self.default = default_value
        self.type_handler = type_handler


class UIEnabledFunction:
    def __init__(self, name, parameters, metadata, function, title, description):
        self.name = name
        self.parameters = parameters
        self.metadata = metadata
        self.function = function
        self.title = title
        self.description = description


ui_enabled_functions = defaultdict(list)


def ui_enabled(group="home", title="", description="", **kwargs):
    def decorator(func):
        func_name = func.__name__
        params = inspect.signature(func).parameters
        param_info = []
        for name, param in params.items():
            type_="str"
            try:
                type_ = str(param).split(":")[1].split("=")[0].strip() if param.annotation != param.empty else 'str'
            except:
                print(f"Unable to identify type for NAME({name}) PARAM({param}) ANNOTATION({param.annotation})")
            param_info.append(ParameterInfo(
                name,
                type_,
                param.default if param.default != param.empty else "",
                type_handler(type_)
            ))

        ui_enabled_functions[group].append(UIEnabledFunction(
            func_name,
            param_info,
            kwargs,
            func,
            title if title else func_name,
            description
        ))
        return func

    return decorator


global_variables = {}


def ui_global(name, default_value, description=""):
    def decorator(func):
        if name in global_variables:
            raise Exception(f"Global variable {name} already exists")

        global_variables[name] = {
            "func": func,  # Function to set the default value
            "description": description,
            "value": default_value
        }
        return func

    return decorator
