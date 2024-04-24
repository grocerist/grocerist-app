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

# Categories and the number of documents they were mentioned in
# and the same for each good (for drilldown chart)

# Create some main categories as placeholders
dummy_main_categories = ["Main category 1", "Main category 2", "Main category 3"]
categories_series = [
    {
        "name": dummy_category,
        "y": 100,
        "drilldown": dummy_category,
    } for dummy_category in dummy_main_categories
]
# For now, all dummy categories contain all the real categories
categories_drilldown_level_1 = [
    {
        "name": dummy_category,
        "id": dummy_category,  # id to match drilldown category
        "data": [{
            "name": category["name"],
            "y": category["doc_count"],
            "drilldown": category["name"]
        } for category in categories_data
        ],
    } for dummy_category in dummy_main_categories
]
categories_drilldown_level_2 = [
    {
        "name": category["name"],
        "id": category["name"],  # id to match drilldown category
        "data": [
            {
                "name": good["name"], 
                "y": len(goods_data[good["id"]]["documents"])
            }
            for good in category["goods"]
        ],
    }
    for category in categories_data
]
# Combine the two levels of drilldown
# it doesn't matter if they are in the same list, since Highcharts matches them by id
categories_drilldown = categories_drilldown_level_1 + categories_drilldown_level_2

# DATA FOR MENTIONS OVER DECADES CHART
docs_data = read_json_file("documents.json")

# Extract years of creation from documents, excluding None values
years_of_creation = [
    int(doc["year_of_creation_hicri"])
    for doc in docs_data.values()
    if doc.get("year_of_creation_hicri")
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
        year_of_creation = docs_data[doc].get("year_of_creation_hicri")
        if year_of_creation is not None:
            decade = round_down_to_ten(int(year_of_creation))
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
        "categories": categories_series,
        "categories_drilldown": categories_drilldown,
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
