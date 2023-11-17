#!/bin/bash

echo "fetching the data"
python fetch_data.py

echo "creating some geojson"
python make_geojson.py

echo "building the HTML files"
python build.py