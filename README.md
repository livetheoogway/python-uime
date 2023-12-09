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

Release details can be found at [PyPi](https://pypi.org/project/python-uime/)

Python-UIME (User Interface for Python Methods) is a Python package that enables developers to easily create web-based user interfaces for Python functions. It uses decorators to mark functions for UI exposure and a built-in Flask server to render the UI. This package is ideal for quickly setting up simple UIs for Python scripts, making it easier to interact with them through a web browser.

## TL;DR
The promise: With-in 3 lines of code, you will be able to get a working UI form out of your python functions<br>
Another promise: You won't regret the time spent in reading the [Motivation](#Motivation) section, it is not too long<br>
But for the GenZ instant gratification folks: watch this gif (which I totally struggled to create):


## Motivation
I'm pretty sure I'm not the only lazy developer that over-engineers every small daily task as scripts. <br> 
Honestly, this is yet another attempt of the aforementioned over-engineering, towards making it as easy as possible to whip up a quick UI to run those scripts.<br>
Yes, there are good alternatives, `argparse` being a popular one for running your scripts through cli. But I've always struggled with it the moment the script has multiple functionalities or modules. 
The day you start forgetting your engineering principles and start overloading your one script to do many things (because duh! that was the whole point of writing it as a script), these cli tools start to fall apart.  
Not the mention the amount of code you'd have to write, stitching parsers and subparsers. <br>

This goes without saying, for proper production scripts, UI-me is not the way to go. But for those quick and dirty daily / personal scripts, you should find this useful <br>


## Features
- Easy Function Exposure: Decorate Python functions with `@ui_enabled` to expose them as web forms.
- Automatic UI Generation: Generates web UIs for decorated functions, with form fields corresponding to function parameters.
- Grouping of Functions: Organize functions into groups (nav-tabs) in the UI for better organization.
- Customizable Function Metadata: Specify titles, descriptions, and other metadata for functions.
- Built-in Web Server: Comes with an integrated Flask web server to host the UI.
- Clipboard Support: Easy copy-to-clipboard feature for function outputs.

## Installation
Install Python UI-me using pip:
```bash
python3 -m pip install python-uime
```

## Usage

Basically 3 lines of code

```python
from uime import start_server, ui_enabled  ## <--- This is line 1

##  Below is line 2
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
    start_server()  ## <--- This is line 3
```
![img.png](resources/ui-example.png)

## Fixes Pending


## Contributions

Please raise Issues, Bugs or any feature requests at [Github Issues](https://github.com/livetheoogway/python-uime/issues)
. <br>
If you plan on contributing to the code, fork the repository and raise a Pull Request back here.