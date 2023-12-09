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


import logging
import sys

from flask import Flask, render_template, request, jsonify

from .decorator import ui_enabled_functions

app = Flask(__name__)


def get_default_logger():
    logger = logging.getLogger('uime')
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    logger.setLevel(logging.INFO)
    return logger


logger = get_default_logger()


@app.route('/function/<group>/<func_name>', methods=['POST'])
def run_function(group, func_name):
    # do a urldecode on the group
    from urllib.parse import unquote
    group = unquote(group)
    if group in ui_enabled_functions and func_name in list(map(lambda x: x['name'], ui_enabled_functions[group])):
        func_info = list(filter(lambda x: x['name'] == func_name, ui_enabled_functions[group]))[0]
        func = func_info['function']
        try:
            args = request.json
            result = func(**args)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'Function not found'}), 404


@app.route('/')
def index():
    return render_template('index.html', groups=ui_enabled_functions)


def start_server(host: str | None = None,
                 port: int | None = None,
                 debug: bool = False):
    functions = ""
    for group, func_list in ui_enabled_functions.items():
        functions += f"Functions under ({group}):\n"
        for func in func_list:
            functions += f"\t{func['name']}\n"

    logger.info(f"Registered functions:\n{functions}")
    app.run(debug=debug, host=host, port=port)


if __name__ == '__main__':
    app.run(debug=True)
