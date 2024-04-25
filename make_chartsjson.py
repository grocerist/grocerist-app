import itertools
import os
import json
from collections import Counter
import copy


# Read JSON file
def read_json_file(file_name):
    with open(
        os.path.join("html", "json_dumps", file_name), "r", encoding="utf-8"
    ) as file:
        data = json.load(file)
        return data


def round_down_to_ten(year):
    return (year // 10) * 10


def calculate_century(year):
    if year % 100 == 0:
        return year // 100
    else:
        return year // 100 + 1


# Calculate percentage and round it to the specified precision
def calculate_percentage(count, total, precision=2):
    return round((count / total) * 100, precision)


# DATA FOR RELIGIONS CHART
data = read_json_file("persons.json")

# Create a dictionary to store the count of persons per religion
religion_count = {}

# Iterate through each person in the data
for person_id, person_data in data.items():
    religion_entries = person_data.get("religion", [])

    if len(religion_entries) > 1:
        # Create a combined key for persons with multiple religion values
        religion_values = [entry.get("value", "") for entry in religion_entries]
        religion_key = "|".join(religion_values)

    elif len(religion_entries) == 1:
        # If there's only one religion value, use it directly as the key
        religion_key = religion_entries[0].get("value", "")
    else:
        # Handle the case where there are no religion entries
        religion_key = "Unknown"
    # Update the count for specific religion
    religion_count[religion_key] = religion_count.get(religion_key, 0) + 1

# Calculate the total number of persons
total_persons = sum(religion_count.values())

# Calculate the percentages for each religion and store them in a list
religions_results = [
    {"name": religion, "y": calculate_percentage(count, total_persons)}
    for religion, count in religion_count.items()
]

# DATA FOR CATEGORIES CHART
categories_data = read_json_file("categories.json")
goods_data = read_json_file("goods.json")
docs_data = read_json_file("documents.json")


century_category_dict = {
    category["name"]: {"18": 0, "19": 0} for category in categories_data
}

for category in categories_data:
    category_name = category["name"]
    doc_list = [document["id"] for document in category["documents"]]
    for doc in doc_list:
        year_of_creation = docs_data[doc].get("year_of_creation_miladi")
        if year_of_creation is not None and year_of_creation != "":
            century = calculate_century(int(year_of_creation.split("-")[0]))
            if century in [
                18,
                19,
            ]:  # for now, the 1 document from the 17th century is not included
                century_category_dict[category_name][str(century)] += 1

century_goods_dict = {
    good["name"]: {"18": 0, "19": 0} for id, good in goods_data.items()
}
for id, good_data in goods_data.items():
    good_name = good_data["name"]
    doc_list = [str(document["id"]) for document in good_data["documents"]]
    for doc in doc_list:
        year_of_creation = docs_data[doc].get("year_of_creation_miladi")
        if year_of_creation is not None and year_of_creation != "":
            century = calculate_century(int(year_of_creation.split("-")[0]))
            if century in [18, 19]:
                century_goods_dict[good_name][str(century)] += 1

# Categories and the number of documents they were mentioned in
# and the same for each good (for drilldown chart)
print(category for category in century_category_dict)
categories_18 = [
    {
        "name": category,
        "y": century_category_dict[category]["18"],
        "drilldown": category,
    }
    for category in century_category_dict
]

categories_18_drilldown = [
    {
        "name": category_name,
        "id": category_name,  # id for HighCharts
        "data": [
            {"name": good["name"], "y": century_goods_dict[good["name"]]["18"]}
            for category in categories_data
            if category["name"] == category_name
            for good in category["goods"]
        ],
    }
    for category_name in century_category_dict
]

# DATA FOR MENTIONS OVER DECADES CHART
# Extract years of creation from documents, excluding None values
# For now, we're splitting the date string and taking the first part, will be fixed in the data later
years_of_creation = [
    int(doc["year_of_creation_miladi"].split("-")[0])
    for doc in docs_data.values()
    if doc.get("year_of_creation_miladi")
]

# Create a sorted list of all the decades
decades = sorted(set(round_down_to_ten(year) for year in years_of_creation))

# Count the total number of documents in each decade
total_docs_per_decade = Counter(round_down_to_ten(year) for year in years_of_creation)
# Initialize decade_dict with zeros for all categories and decades
decade_dict = {
    category["name"]: {decade: 0 for decade in decades} for category in categories_data
}
for category in categories_data:
    category_name = category["name"]
    doc_list = [document["id"] for document in category["documents"]]
    for doc in doc_list:
        year_of_creation = docs_data[doc].get("year_of_creation_miladi")
        if year_of_creation is not None and year_of_creation != "":
            decade = round_down_to_ten(int(year_of_creation.split("-")[0]))
            decade_dict[category_name][decade] += 1

# Normalize the counts to percentages
normalized_decade_dict = copy.deepcopy(decade_dict)
for category_name, decade_counts in normalized_decade_dict.items():
    for decade, count in decade_counts.items():
        total_docs_in_decade = total_docs_per_decade.get(decade, 1)
        normalized_decade_dict[category_name][decade] = calculate_percentage(
            count, total_docs_in_decade
        )

# Symbols for the time series chart
symbols = ["square", "diamond", "circle", "triangle"]
symbol_cycle = itertools.cycle(symbols)
# Generate results for Highcharts, once with absolute counts, once with normalized
decades_results = [
    {
        "name": category,
        "marker": {"symbol": next(symbol_cycle)},
        "data": list(decade_counts.values()),
    }
    for category, decade_counts in sorted(decade_dict.items())
]
normalized_decades_results = [
    {
        "name": category,
        "marker": {"symbol": next(symbol_cycle)},
        "data": list(decade_counts.values()),
    }
    for category, decade_counts in sorted(normalized_decade_dict.items())
]

# Convert the results to JSON format and write to a file
result_json = json.dumps(
    {
        "religions": religions_results,
        "categories": categories_18,
        "categories_drilldown": categories_18_drilldown,
        "categories_over_decades": {
            "categories": [str(decade) for decade in decades],
            "series": decades_results,
        },
        "normalized_categories_over_decades": {
            "categories": [str(decade) for decade in decades],
            "series": normalized_decades_results,
        },
    },
    indent=2,
)

with open(
    os.path.join("html", "json_dumps", "charts.json"), "w", encoding="utf-8"
) as result_file:
    result_file.write(result_json)
