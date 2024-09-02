import itertools
import os
import json
from collections import Counter
import copy
import datetime


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


# LOAD ALL NECESSARY JSON FILES
persons_data = read_json_file("persons.json").values()
categories_data = read_json_file("categories.json").values()
goods_data = read_json_file("goods.json").values()
docs_data = read_json_file("documents.json")

# DATA FOR RELIGIONS CHART
# Create a dictionary to store the count of persons per religion
religion_count = {}

# Iterate through each person in the data
for person in persons_data:
    if person.get("name"):
        religion_entries = person.get("religion", [])
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
# Categories and the number of documents they were mentioned in
# and the same for each good (for drilldown chart)


def create_nested_goods_dict(category_dict):
    nested_goods = {}
    for data in category_dict:
        if data["is_main_category"]:
            nested_goods[data["name"]] = {}
        if not data["is_main_category"]:
            main_cat = data["part_of"][0]["value"]
            if main_cat not in nested_goods:
                nested_goods[main_cat] = {}
            nested_goods[main_cat][data["name"]] = data["goods"]
    return nested_goods


def extract_year(date):
    if not date:
        return None
    try:
        # Attempt to parse the date in ISO format
        parsed_date = datetime.datetime.fromisoformat(date)
        return parsed_date.year
    except ValueError:
        # If parsing fails, return None
        return None


def calculate_century_count(data_dict, docs_data):
    """
    Calculates the count of documents in each century for each category/grocery in the data dictionary.

    Args:
        data_dict (dict): A dictionary containing data from the goods JSON.
        docs_data (dict): A dictionary containing information from the documents JSON.

    Returns:
        dict: A dictionary containing the count of documents in each century for each category/grocery.
    """
    century_dict = {data["name"]: {"18": set(), "19": set()} for data in data_dict}
    for data in data_dict:
        data_name = data["name"]
        doc_list = [str(document["id"]) for document in data["documents"]]
        for doc in doc_list:
            date_of_creation = docs_data[doc].get("creation_date_ISO")
            year = extract_year(date_of_creation)
            if year is not None:
                century = calculate_century(year)
                # for now, the 1 document from the 17th century is not included
                if century in [18, 19]:
                    # century_dict[data_name][str(century)] += 1
                    century_dict[data_name][str(century)].add(doc)
    return century_dict


nested_goods_dict = create_nested_goods_dict(categories_data)
century_goods_dict = calculate_century_count(goods_data, docs_data)

categories_18 = {}
categories_19 = {}
for main_category in nested_goods_dict:
    categories_18[main_category] = {}
    categories_19[main_category] = {}
    for sub_category in nested_goods_dict[main_category]:
        categories_18[main_category][sub_category] = {}
        categories_19[main_category][sub_category] = {}
        for good in nested_goods_dict[main_category][sub_category]:
            name = good["value"]
            categories_18[main_category][sub_category][name] = century_goods_dict[name][
                "18"
            ]
            categories_19[main_category][sub_category][name] = century_goods_dict[name][
                "19"
            ]


def generate_drilldown_chart_data(categories_dict):
    main_categories = []  # Data for all main categories
    sub_categories_level = []  # Data for all subcategories
    products_level = []  # Data for all products

    for main_category in categories_dict:
        main_category_doc_set = set()
        column_data = {
            "name": main_category,
            "y": 0,  # placeholder
            "drilldown": main_category,
        }
        # data for the chart that will appear when clicking on a main category
        drilldown_level1 = {
            "name": main_category,
            "id": main_category,  # id to match drilldown category
            "data": [],
        }
        for sub_category in categories_dict[main_category]:
            # data for the chart that will appear when clicking on a subcategory, showing the products
            drilldown_level2 = {"name": sub_category, "id": sub_category, "data": []}
            sub_category_doc_set = set()

            for product in categories_dict[main_category][sub_category]:
                drilldown_level2["data"].append(
                    {
                        "name": product,
                        "y": len(categories_dict[main_category][sub_category][product]),
                    }
                )
                for doc in categories_dict[main_category][sub_category][product]:
                    sub_category_doc_set.add(doc)
                    main_category_doc_set.add(doc)
                products_level.append(drilldown_level2)

            drilldown_level1["data"].append(
                {
                    "name": sub_category,
                    "y": len(sub_category_doc_set),
                    "drilldown": sub_category,
                }
            )
        sub_categories_level.append(drilldown_level1)
        column_data["y"] = len(main_category_doc_set)
        main_categories.append(column_data)

    # Combine the two levels of drilldown at the end,
    # it doesn't matter if they are in the same list, since Highcharts matches them by id
    drilldown_data = sub_categories_level + products_level
    return main_categories, drilldown_data


main_categories18, drill_down18 = generate_drilldown_chart_data(categories_18)
main_categories19, drill_down19 = generate_drilldown_chart_data(categories_19)

# DATA FOR MENTIONS OVER DECADES CHART


# Extract years of creation from documents, excluding None values
# For now, we're splitting the date string and taking the first part, will be fixed in the data later
years_of_creation = [
    year
    for year in (extract_year(doc["creation_date_ISO"]) for doc in docs_data.values())
    if year is not None
]

# Create a sorted list of all the decades
decades = sorted(set(round_down_to_ten(year) for year in years_of_creation))

# Count the total number of documents in each decade
total_docs_per_decade = Counter(round_down_to_ten(year) for year in years_of_creation)
# Initialize decade_dict with zeros for all categories and decades
decade_dict = {
    category["name"]: {decade: 0 for decade in decades} for category in categories_data
}
for main_category in categories_data:
    category_name = main_category["name"]
    doc_list = [document["id"] for document in main_category["documents"]]
    for doc in doc_list:
        date_of_creation = docs_data[str(doc)].get("creation_date_ISO")
        year = extract_year(date_of_creation)
        if year is not None:
            decade = round_down_to_ten(year)
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
        "categories_18": main_categories18,
        "categories_18_drilldown": drill_down18,
        "categories_19": main_categories19,
        "categories_19_drilldown": drill_down19,
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
