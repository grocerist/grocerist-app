[![flake8 Lint](https://github.com/grocerist/grocerist-app/actions/workflows/lint.yml/badge.svg)](https://github.com/grocerist/grocerist-app/actions/workflows/lint.yml)

# grocerist-app
Repo for Grocerist's Web-Application

## install

* clone the repo `git clone https://github.com/grocerist/grocerist-app.git`
* create a virtual environment `python -m venv venv`
* activate the environment `source venv/bin/activate` (.\venv\Scripts\Activate.ps1 for Windows Powershell)
* install needed packages `pip install -r requirements.txt`

## build the application

* make sure your virtual environment is activated and you have all dependencies installed
* have a look at `.github/workflows/build.yml` to see which scripts need be run in which sequence
* run `./build.sh` to call all needed python scripts (or run them individually)

## run the application

* change into the `html` folder; `cd html`
* start a python dev server `python -m http.server`
* go to http://127.0.0.1:8000/


## linting and code formatting

* make sure you have `flake8` and `black` installed (or just run `pip install -r requirements.txt`)

* run `flake8` for linting
run `black .` for code formatting, ideally the latter fixes the errors found by flake8
