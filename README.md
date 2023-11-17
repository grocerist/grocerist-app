# grocerist-app
Repo for Grocerist's Web-Application

## install

* clone the repo `git clone https://github.com/grocerist/grocerist-app.git`
* create a virtual environment `python -m venv venv`
* activate the environment `source venv/bin/activate`
* install needed packages `pip install -r requirements.txt`

## build the application

* make sure your virtual environment is activated and you have all dependencies installed
* have a look at `.github/workflows/build.yml` to see which scripts need be run in which sequence
* run `./build.sh` to call all needed python scripts

## run the application

* change into the `html` folder; `cd html`
* start a python dev server `python -m http.server`
* go to http://0.0.0.0:8000/