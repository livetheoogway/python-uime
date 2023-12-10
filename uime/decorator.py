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
from collections import defaultdict

ui_enabled_functions = defaultdict(list)


def ui_enabled(group="home", title="", description="", **kwargs):
    def decorator(func):
        func_name = func.__name__
        params = inspect.signature(func).parameters

        ui_enabled_functions[group].append({
            "name": func_name,
            "parameters": list(params.keys()),
            "metadata": kwargs,
            "function": func,
            "title": title if title else func_name,
            "description": description
        })
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
