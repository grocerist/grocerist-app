#!/bin/bash

echo "fetching the data"
python fetch_data.py

echo "creating and updating JSON files, building the HTML files"
python build.py
