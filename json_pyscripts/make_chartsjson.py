import itertools
import os
import json
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

# DATA FOR CATEGORIES CHART & TIME SERIES CHARTS
# Categories and the number of documents they were mentioned in
# and the same for each good (for drilldown chart)


def create_nested_goods_dict(category_dict):
    """
    Create a nested dictionary of goods based on the given category dictionary.

    Parameters:
    - category_dict (dict): Dictionary containing the data from the categories json.

    Returns:
    - nested_goods (dict): A nested dictionary containing the goods categorized by main categories and subcategories.
    NOTES
    Structure of this dictionary:
    main category: ->
    "goods": list of goods that are directly under the main category,
    "subcategories" -> subcategory: list of goods under the subcategory

    "goods" would end up empty if all goods are in subcategories,
    "subcategories" would be empty if all goods are directly under the main category
    """
    nested_goods = {}
    # First pass: Initialize main categories with goods
    for data in category_dict:
        if data["category_type"]["value"] == "main":
            nested_goods[data["name"]] = {"goods": data["goods"], "subcategories": {}}

    # Second pass: Process subcategories
    for data in category_dict:
        if data["category_type"]["value"] == "sub":
            main_cat = data["part_of"][0]["value"]
            nested_goods[main_cat]["subcategories"][data["name"]] = {
                "goods": data["goods"],
                "subcategories": {},
            }
            # Remove goods from the main category if they are in a subcategory
            nested_goods[main_cat]["goods"] = [
                good
                for good in nested_goods[main_cat]["goods"]
                if good not in data["goods"]
            ]

    # Third pass: Process sub-subcategories
    for data in category_dict:
        if data["category_type"]["value"] == "subsub":
            sub_cat = data["part_of"][0]["value"]
            # Find the main category that contains this subcategory
            for main_cat, main_cat_data in nested_goods.items():
                if sub_cat in main_cat_data["subcategories"]:
                    main_cat_data["subcategories"][sub_cat]["subcategories"][
                        data["name"]
                    ] = data["goods"]
                    # Remove goods from the subcategory if they are in a sub-subcategory
                    main_cat_data["subcategories"][sub_cat]["goods"] = [
                        good
                        for good in main_cat_data["subcategories"][sub_cat]["goods"]
                        if good not in data["goods"]
                    ]
                    break

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


def goods_century_decade_count(goods_data, docs_data, decades):
    """
    Calculates the number of mentions in each century and each decade per good.
    """
    century_dict = {}
    decade_dict = {}

    for good in goods_data:
        good_name = good["name"]
        # Initialize with zeros for all decades and centuries
        decade_dict[good_name] = {decade: 0 for decade in decades}
        century_dict[good_name] = {"18": 0, "19": 0}

        doc_list = [str(document["id"]) for document in good["documents"]]
        for doc in doc_list:
            # data for century dict
            century = docs_data[doc].get("century")
            if century is not None:
                century = century.get("value")
                # NOTE: for now, the 1 document from the 17th century is not included
                if century in ["18", "19"]:
                    century_dict[good_name][century] += 1
            # data for decade dict
            date_of_creation = docs_data[doc].get("creation_date_ISO")
            year = extract_year(date_of_creation)
            if year is not None:
                decade = round_down_to_ten(year)
                decade_dict[good_name][decade] += 1

    return century_dict, decade_dict


def process_goods(goods, century_goods_dict, century):
    processed_goods = {}
    for good in goods:
        name = good["value"]
        processed_goods[name] = century_goods_dict[name][century]
    return processed_goods


def process_sub_subcategories(sub_subcategories, century_goods_dict, century):
    processed_sub_subcategories = {}
    for sub_sub_category, goods in sub_subcategories.items():
        processed_sub_subcategories[sub_sub_category] = process_goods(
            goods, century_goods_dict, century
        )
    return processed_sub_subcategories


def process_subcategories(subcategories, century_goods_dict, century):
    processed_subcategories = {}
    for sub_category, data in subcategories.items():
        processed_subcategories[sub_category] = {
            "goods": process_goods(data["goods"], century_goods_dict, century),
            "subcategories": process_sub_subcategories(
                data["subcategories"], century_goods_dict, century
            ),
        }
    return processed_subcategories


def combine_dictionaries(nested_goods_dict, century_goods_dict):
    categories_18 = {}
    categories_19 = {}

    for main_category, data in nested_goods_dict.items():
        categories_18[main_category] = {}
        categories_19[main_category] = {}

        # Process subcategories
        if "subcategories" in data:
            categories_18[main_category].update(
                process_subcategories(data["subcategories"], century_goods_dict, "18")
            )
            categories_19[main_category].update(
                process_subcategories(data["subcategories"], century_goods_dict, "19")
            )

        # Process goods with no subcategory
        if "goods" in data:
            categories_18[main_category].update(
                process_goods(data["goods"], century_goods_dict, "18")
            )
            categories_19[main_category].update(
                process_goods(data["goods"], century_goods_dict, "19")
            )

    return categories_18, categories_19


def generate_drilldown_chart_data(categories_dict):
    main_categories = []  # Data for all main categories
    sub_categories_level = []  # Data for all subcategories
    sub_sub_categories_level = []  # Data for all sub-subcategories
    products_level = []  # Data for all products

    for main_category in categories_dict:
        main_category_sum = 0
        # main_category_doc_set = set()
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
        for item in categories_dict[main_category]:
            # Test if it's a subcategory that has a sub-subcategory
            if isinstance(categories_dict[main_category][item], dict):
                # this is for subcategories with a sub-subcategory
                sub_category = item
                # data for the chart that will appear when clicking on a subcategory,
                # showing products and sub-subcategories
                drilldown_level2 = {
                    "name": sub_category,
                    "id": sub_category,
                    "data": [],
                }
                # test if there is another subcategory
                if categories_dict[main_category][sub_category]["subcategories"]:
                    sub_category_sum = 0
                    for subsub_category in categories_dict[main_category][sub_category][
                        "subcategories"
                    ]:
                        drilldown_level3 = {
                            "name": subsub_category,
                            "id": subsub_category,
                            "data": [],
                        }
                        subsub_category_sum = sum(
                            categories_dict[main_category][sub_category][
                                "subcategories"
                            ][subsub_category].values()
                        )
                        main_category_sum += subsub_category_sum
                        sub_category_sum += subsub_category_sum

                        for product in categories_dict[main_category][sub_category][
                            "subcategories"
                        ][subsub_category]:
                            drilldown_level3["data"].append(
                                {
                                    "name": product,
                                    "y": categories_dict[main_category][sub_category][
                                        "subcategories"
                                    ][subsub_category][product],
                                }
                            )
                            products_level.append(drilldown_level3)
                        drilldown_level2["data"].append(
                            {
                                "name": subsub_category,
                                "y": subsub_category_sum,
                                "drilldown": subsub_category,
                            }
                        )
                    # add the products on that are not in a sub-subcategory
                    for product in categories_dict[main_category][sub_category][
                        "goods"
                    ]:
                        drilldown_level2["data"].append(
                            {
                                "name": product,
                                "y": categories_dict[main_category][sub_category][
                                    "goods"
                                ][product],
                            }
                        )
                    sub_sub_categories_level.append(drilldown_level2)
                    drilldown_level1["data"].append(
                        {
                            "name": sub_category,
                            "y": sub_category_sum,
                            "drilldown": sub_category,
                        }
                    )
                else:
                    # there is no sub-subcategory
                    # calculate subcategory sum
                    sub_category_sum = sum(
                        categories_dict[main_category][sub_category]["goods"].values()
                    )
                    main_category_sum += sub_category_sum

                    drilldown_level1["data"].append(
                        {
                            "name": sub_category,
                            "y": sub_category_sum,
                            "drilldown": sub_category,
                        }
                    )
                    # data for the chart that will appear when clicking on a subcategory, showing the products
                    drilldown_level2 = {
                        "name": sub_category,
                        "id": sub_category,
                        "data": [],
                    }

                    for product in categories_dict[main_category][sub_category][
                        "goods"
                    ]:
                        drilldown_level2["data"].append(
                            {
                                "name": product,
                                "y": categories_dict[main_category][sub_category][
                                    "goods"
                                ][product],
                            }
                        )
                    products_level.append(drilldown_level2)
            else:
                # there is no drilldown level 2
                count = categories_dict[main_category][item]
                drilldown_level1["data"].append(
                    {
                        "name": item,
                        "y": count,
                    }
                )
                main_category_sum += count
        # sort subcategories by name
        drilldown_level1["data"] = sorted(
            drilldown_level1["data"], key=lambda x: x["name"]
        )

        sub_categories_level.append(drilldown_level1)
        column_data["y"] = main_category_sum
        main_categories.append(column_data)

    # Sort all lists by the 'name' attribute
    main_categories = sorted(main_categories, key=lambda x: x["drilldown"])

    # Combine the two levels of drilldown at the end,
    # it doesn't matter if they are in the same list, since Highcharts matches them by id
    drilldown_data = sub_categories_level + sub_sub_categories_level + products_level
    return main_categories, drilldown_data


def sort_category_names(categories_data, nested_goods_dict):
    # Create list of names of main categories
    main_category_names = sorted(
        category["name"]
        for category in categories_data
        if category["category_type"]["value"] == "main"
    )

    # Create a dictionary to hold the nested structure
    main_sub_category_names = {category: [] for category in main_category_names}

    # Initialize the list for subsubcategories
    subsub_category_names = []

    # Populate the dictionary with subcategories and subsubcategories
    for category in nested_goods_dict:
        if category in main_category_names:
            subcategories = nested_goods_dict[category].get("subcategories", {})
            for subcategory, subcat_data in subcategories.items():
                subsubcategories = sorted(subcat_data.get("subcategories", {}).keys())
                if subsubcategories:
                    main_sub_category_names[category].extend(
                        [subcategory] + subsubcategories
                    )
                    subsub_category_names.extend(subsubcategories)
                else:
                    main_sub_category_names[category].append(subcategory)

    # Create a flat list with the subcategories alphabetically ordered
    sorted_category_names = []
    for category in main_category_names:
        sorted_category_names.append(category)
        sorted_subcategories = sorted(main_sub_category_names[category])
        sorted_category_names.extend(sorted_subcategories)

    return main_category_names, subsub_category_names, sorted_category_names


# Create a nested dictionary containing main categories, subcategories, and goods
nested_goods_dict = create_nested_goods_dict(categories_data)

# Extract years of creation from documents, excluding None values
years_of_creation = [
    year
    for year in (extract_year(doc["creation_date_ISO"]) for doc in docs_data.values())
    if year is not None
]

# Create a sorted list of all the decades
# Count the total number of documents in each decade
decades = sorted(set(round_down_to_ten(year) for year in years_of_creation))

# Calculate the number of documents per century and decade for each product
century_goods_dict, decade_good_dict = goods_century_decade_count(
    goods_data, docs_data, decades
)

# Combine the previous two dictionaries into one for each century
categories_18, categories_19 = combine_dictionaries(
    nested_goods_dict, century_goods_dict
)

# Create the drilldown data for the chart
main_categories18, drill_down18 = generate_drilldown_chart_data(categories_18)
main_categories19, drill_down19 = generate_drilldown_chart_data(categories_19)

##################
decade_dict = {}
for category in categories_data:
    category_name = category["name"]
    decade_dict[category_name] = {decade: 0 for decade in decades}
    # find the goods belonging to this category
    goods_list = [good["value"] for good in category["goods"]]
    for good in goods_list:
        for decade in decades:
            decade_dict[category_name][decade] += decade_good_dict[good][decade]

# Normalize the counts to percentages
total_mentions_per_decade = {}
# Sum up the mentions per decade
for category, mentions in decade_dict.items():
    for decade, count in mentions.items():
        if decade not in total_mentions_per_decade:
            total_mentions_per_decade[decade] = 0
        total_mentions_per_decade[decade] += count

normalized_decade_dict = copy.deepcopy(decade_dict)
for category_name, decade_counts in normalized_decade_dict.items():
    for decade, count in decade_counts.items():
        total_mentions_in_decade = total_mentions_per_decade.get(decade, 1)
        normalized_decade_dict[category_name][decade] = calculate_percentage(
            count, total_mentions_in_decade
        )

# Steps needed for the results
main_category_names, subsub_category_names, sorted_category_names = sort_category_names(
    categories_data, nested_goods_dict
)

# Sort decade_dict on basis of the category_names list
sorted_decade_dict = dict()
sorted_list = list((i, decade_dict.get(i)) for i in sorted_category_names)
for i in sorted_list:
    sorted_decade_dict.setdefault(i[0], i[1])

# Sort normalized_decade_dict on basis of the category_names list
sorted_normalized_decade_dict = dict()
sorted_list = list((i, normalized_decade_dict.get(i)) for i in sorted_category_names)
for i in sorted_list:
    sorted_normalized_decade_dict.setdefault(i[0], i[1])

# Symbols for the time series chart
symbols = ["square", "diamond", "circle", "triangle"]
symbol_cycle = itertools.cycle(symbols)
# Generate results for Highcharts, once with absolute counts, once with normalized

decades_results = [
    {
        "name": category,
        "marker": {"symbol": next(symbol_cycle)},
        "data": list(decade_counts.values()),
        "category": (
            "main"
            if category in main_category_names
            else "subsub" if category in subsub_category_names else "sub"
        ),
    }
    for category, decade_counts in sorted_decade_dict.items()
]

normalized_decades_results = [
    {
        "name": category,
        "marker": {"symbol": next(symbol_cycle)},
        "data": list(decade_counts.values()),
        "category": (
            "main"
            if category in main_category_names
            else "subsub" if category in subsub_category_names else "sub"
        ),
    }
    for category, decade_counts in sorted_normalized_decade_dict.items()
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
