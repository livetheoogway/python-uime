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

from flask import Flask, render_template, request, jsonify, redirect

from .decorator import ui_enabled_functions, global_variables

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


@app.route('/globals', methods=['GET', 'POST'])
def handle_globals():
    if request.method == 'POST':
        for var_name, var_info in global_variables.items():
            if var_name in request.json:
                global_variables[var_name]['func'](request.json[var_name])
                global_variables[var_name]['value'] = request.json[var_name]
        return redirect('/')
    else:
        # Render a form to edit global variables
        return render_template(globals=global_variables)


@app.route('/function/<group>/<func_name>', methods=['POST'])
def run_function(group, func_name):
    # do a urldecode on the group
    from urllib.parse import unquote
    group = unquote(group)
    if group in ui_enabled_functions and func_name in list(map(lambda x: x.name, ui_enabled_functions[group])):
        func_info = list(filter(lambda x: x.name == func_name, ui_enabled_functions[group]))[0]
        func = func_info.function
        try:
            args = request.json
            final_args = dict()
            for param_info in func_info.parameters:  # Assuming you have parameter info
                final_args[param_info.name] = param_info.type_handler(args.get(param_info.name), param_info.default)

            result = func(**final_args)
            return jsonify(result)
        except Exception as e:
            logger.exception(e)
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'Function not found'}), 404


@app.route('/')
def index():
    return render_template('index.html', groups=ui_enabled_functions, global_vars=global_variables)


def start_server(host: str | None = None,
                 port: int | None = None,
                 debug: bool = False):
    functions = ""
    for group, func_list in ui_enabled_functions.items():
        functions += f"Functions under ({group}):\n"
        for func in func_list:
            functions += f"\t{func.name}\n"

    logger.info(f"Registered functions:\n{functions}")
    app.run(debug=debug, host=host, port=port)


if __name__ == '__main__':
    app.run(debug=True)
