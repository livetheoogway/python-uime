<p align="center">
  <h1 align="center">Python UI-Me</h1>
  <p align="center">A simple python decorator, to build UI forms out of your everyday python functions<p>
  <p align="center">
    <a href="https://pypi.org/project/python-uime">
    	<img src="https://img.shields.io/pypi/v/python-uime"/>
    </a>
    <a href="https://github.com/livetheoogway/python-uime/blob/master/LICENSE">
    	<img src="https://img.shields.io/github/license/livetheoogway/python-uime" alt="license" />
    </a></p>
</p>

## UI-Me

Python UI-Me (as in: Python methods saying "make elegant UI forms out of me") is a tiny-but-mighty package that turns
your everyday functions into sleek web control panels. Tag a function with a decorator, let the bundled Flask app spin
up, and suddenly your script feels like a real product instead of a one-off command.

## TL;DR

**What you get:** In three lines you have a hosted UI where every argument becomes an input, responses render in rich JSON, and the whole thing still feels feather-light because it is plain HTML/CSS/JS (no React, no design system du jour).<br>
<br>
**What you keep:** Your playful, slightly chaotic script-driven workflow. UI-Me just gives it buttons, dark mode, and a logo.<br>
<br>
**What to look at first:** The [Motivation](#motivation) story is short and spicy, but if your build server is already screaming, here’s the gif version:<br>
<br>
![demo.gif](resources/demo.gif)

## Motivation

I'm pretty sure I'm not the only lazy developer that over-engineers every tiny chore as a script. This project is my
latest effort toward making those scripts slightly less cryptic to future-me (and whoever is sitting next to me asking
“what happens if I click this?”).<br>
Yes, `argparse` and friends exist. But the minute a single script starts doing five things, or you forget what flags you
invented at 2 AM, CLI ergonomics fall apart. And the amount of boilerplate to wire multiple parsers... no thanks.<br>

So UI-Me is the middle ground: not meant for enterprise-scale production flows, but absolutely meant for the pile of
daily automation you keep collecting. Think of it as [Swagger UI](https://swagger.io/tools/swagger-ui/) for your Python
functions, except it is unapologetically simple and proudly decorator-powered.

## Features

1. **Easy Function Exposure** <br>
   Decorate Python functions with `@ui_enabled` to expose them as web forms.
2. **Automatic UI Generation** <br>
   Generates web UIs for decorated functions, with form fields corresponding to function parameters.
3. **Themes** <br>
   A check-box for the classic developer query, "Does it come with dark mode?". Why Yes, yes it does..
4. **Grouping of Functions** <br>
   Organize functions into <br>
   groups (nav-tabs) in the UI for better organization.
5. **Customizable Function Metadata** <br>
   Specify titles, descriptions, and other metadata for functions.
6. **Built-in Web Server** <br>
   Comes with an integrated Flask web server to host the UI.
7. **Clipboard Support** <br>
   Easy copy-to-clipboard feature for function outputs.
8. **Quick navigation Sidebar** <br>
   If you have too many functions, the sidebar can be used to quickly navigate to your function
9. **Global Variables** <br>
   Set global variables for your script, from within the UI.
10. **Type Inferring (This is Cool !!)** <br>
    Functions that contain arguments with types, are inferred and rendered accordingly in the INPUT form.<br>
    Function arguments with complex data-structures like list of strings, or json strings are
    supported.

## Installation

Install Python UI-me using pip:

```bash
python3 -m pip install python-uime
```

## Usage

Basically 3 lines of code

```python
from uime import start_server, ui_enabled  ## <--- This is line 1


##  Below decorator is line 2
@ui_enabled(group="Greeting", description="This function will greet you (with positivity!)")
def hello_world(name):
    return f"Hello {name}"


@ui_enabled(group="Greeting", title="My Test Function with Nice Title",
            description="This function will return a json (So that you can see it is nicely printed)")
def make_api_call(url, data):
    return json.dumps({"url": url, "data": hello_world(data)})


@ui_enabled(group="Maths", description="This will return a + b")
def sum_math_function(a, b):
    return a + b


@ui_enabled(group="Maths")
def difference_math_function(a, b):
    return a - b


if __name__ == '__main__':
    start_server()  ## <--- This is line 3 (As promised, within 3 lines of code)
    start_server(port=5001, title="My Cool Title", description="I will struggle to describe this well")  # if you wish to customize ports or title
```

![img.png](resources/ui-example.png)

## Advanced Usage

### 1. Setting Global Variables

You might run into situations where you want to set global variables of your script. <br>
This is going to be a little more involved - you need to expose a setter to the global variable, while using a new
decorator `@ui_global` <br>
Here is an example:

```python
from uime import start_server, ui_enabled, ui_global  ## <--- ui_global is the new import

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
def hello_world(name):
    return f"Hello {name}. {DEFAULT} {DEFAULT_2}"  # <-- using the global variables
```

The left navigation bar contains a section for Global Variables, which will allow you to set them. <br>

![img.png](resources/globalvar-example.png)

### 2. Function Parameter Type Inferring

| type          | form input                 | type inferred          |
|---------------|----------------------------|------------------------|
| nothing       | text input                 | str                    |
| str           | text input                 | str                    |
| bool          | switch                     | bool                   |
| int           | number input               | int                    |
| float         | number input               | float                  |
| complex       | number input               | complex                |
| list          | text area                  | list of string         |
| set           | text area                  | set of string          |
| type          | text area                  | list of string         |
| List[str]     | text area                  | list of string         |
| List[int]     | text area                  | list of int            |
| List[float]   | text area                  | list of float          |
| List[complex] | text area                  | list of complex        |
| List[list]    | text area                  | list of list of string |
| dict          | text area for json editing | json to dict           |

Sample code below shows a list of parameters that have different types:

```python
from typing import List
import json
from uime import start_server, ui_enabled


@ui_enabled(group="group1")
def test_list_string(regular_list: list, strings: List[str], ints: List[int], dicts: dict, list_of_list: List[list]):
    return f"""
    list = {regular_list}
    strings= {strings}
    ints= {ints}
    dicts: {json.dumps(dicts)}
    list_of_list: {list_of_list}
    """

```

The UI would look something like this
![global.png](resources/type-infer-demo.png)

> [!NOTE]
> As you observe the above table, a text-area is used to collect inputs for complex datatypes. This is being done on
> purpose to keep things simple, but that simplicity comes at a cost.
> When inferring a list of anything from the text-area - extraction of the list from the large string, is done by using
> delimiters.
> By default, the priority of delimiters are NEWLINE, COMMA, SPACE
> ie: NEWLINE is checked first, if available, the string will be split by newline and returned as a list. Then there is a
> check for COMMA, if available, the string will be split by comma and returned as a list. Finally SPACE.
> In case of <list of list>, it is always a check on NEWLINE for the outer list, and COMMA/SPACE for the inner lists


### 3. Themes

8 different themes to choose from, to make your UI look cool.
1. Dark Tritanopia
2. Soft Dark
3. Dark Purple
4. Dark
5. Light
6. White
7. Solarized
8. Monochrome Blue

![theme_1.png](resources/theme_1.png)
![theme_2.png](resources/theme_2.png)


## Dependencies

The following is list of essential dependencies in python:

- [Flask](https://flask.palletsprojects.com/en/3.0.x/): quickest way to spin up a web server
- [Jinja2](https://jinja.palletsprojects.com/en/2.11.x/templates/): for templating

Reiterating here that UI Me does not depend on any heavy front-end libraries or frameworks. The entire UI is built using
vanilla HTML, CSS (Tailwind CSS for styling) and JavaScript.

## Features Pending

- [ ] Handle overloading of functions (identify functions with ids rather than names)
- [x] Add support for setting `global` variables in the UI ([Setting Global Variables](#1-setting-global-variables))
- [x] Add support for complex data-structures as inputs (like list of strings, or json strings)
- [x] Make default values for parameters as non-mandatory in the form
- [x] Capture parameter data types and change the form field type accordingly

## Contributions

Please raise Issues, Bugs or any feature requests
at [Github Issues](https://github.com/livetheoogway/python-uime/issues). <br>
If you plan on contributing to the code, fork the repository and raise a Pull Request back here.
