import os
import json
import random


# Data for religions chart ###

# Read the JSON file
with open(
    os.path.join("html", "json_dumps", "persons.json"), "r", encoding="utf-8"
) as file:
    data = json.load(file)

# Create a dictionary to store the count of persons per religion
religion_count = {}

# Iterate through each person in the data
for person_id, person_data in data.items():
    # Check if the person has multiple religion values
    religion_entries = person_data.get("religion", [])

    if len(religion_entries) > 1:
        # Collect all religion values for the person
        religion_values = [entry.get("value", "") for entry in religion_entries]

        # Create a combined key by joining the sorted religion values
        religion_key = "|".join(religion_values)

    elif len(religion_entries) == 1:
        # If there's only one religion value, use it directly as the key
        religion_key = religion_entries[0].get("value", "")

    # Update the count for specific religion
    religion_count[religion_key] = religion_count.get(religion_key, 0) + 1

# Calculate the total number of persons
total_persons = sum(religion_count.values())

# Calculate the percentages for each religion and store them in a list
religions_results = []
for religion, count in religion_count.items():
    percentage = (count / total_persons) * 100
    religions_results.append({"name": religion, "y": percentage})

# Data for good categories chart

# Read the JSON file
with open(
    os.path.join("html", "json_dumps", "categories.json"), "r", encoding="utf-8"
) as file:
    categories_data = json.load(file)


categories_results = []
categories_drilldown = []
for category in categories_data:
    category_name = category["name"]
    categories_results.append(
        {"name": category_name, "y": category["doc_count"], "drilldown": category_name}
    )
    goodslist = []
    for good in category["goods"]:
        goodslist.append([good["name"], random.randrange(1, 10)])
    categories_drilldown.append(
        {"name": category_name, "id": category_name, "data": goodslist}
    )


# Convert the results to JSON format and write to a file
result_json = json.dumps(
    {
        "religions": religions_results,
        "categories": categories_results,
        "categories_drilldown": categories_drilldown,
    },
    indent=2,
)

with open(
    os.path.join("html", "json_dumps", "charts.json"), "w", encoding="utf-8"
) as result_file:
    result_file.write(result_json)
