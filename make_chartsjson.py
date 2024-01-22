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
    religions_results.append({"name": religion, "y": round(percentage, 2)})

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


# Data for the time series chart

# Read the JSON file
with open(
    os.path.join("html", "json_dumps", "documents.json"), "r", encoding="utf-8"
) as file:
    docs_data = json.load(file)

# match year_of_creation__hicri from documents.json to the goods categories
# for each category, create a dictionary in a dictionary with the key as the decade and the value as the number of documents in that decade
# format for the time series chart
# get a list of all the decades
    decades = set()
    for doc in docs_data:
        year_of_creation = docs_data[doc]["year_of_creation__hicri"]
        if year_of_creation != None:
            decade = (round(int(year_of_creation),-1))
            decades.add(decade)
    decades = sorted(decades)
    decade_dict = {}
    for category in categories_data:
        category_name = category["name"]
        decade_dict[category_name] = {}
        for decade in decades:
            # initialize for each decade so there will be a value even if there were no documents in that decade
            decade_dict[category_name][decade] = 0
        
        doc_list =  []
        for document in category["documents"]:
            doc_list.append(document["id"])
        for doc in doc_list:
            year_of_creation = docs_data[doc]["year_of_creation__hicri"]
            if year_of_creation != None:
                decade = (round(int(year_of_creation),-1))
                decade_dict[category_name][decade] += 1

print(decade_dict)

categories =  [str(x) for x in decades]
      

decades_results= []
# sort categories so they will be displayed in an alphabetical order later
sorted_categories = sorted(decade_dict.keys())
for category in sorted_categories:
    docs_per_decade = list(decade_dict[category].values())
    decades_results.append(
            {"name": category, "marker": {
                "symbol": 'square'
            }, "data": docs_per_decade}
        )

# Convert the results to JSON format and write to a file
result_json = json.dumps(
    {
        "religions": religions_results,
        "categories": categories_results,
        "categories_drilldown": categories_drilldown,
        "categories_over_decades": {"categories" : categories, "series": decades_results}
    },
    indent=2,
)

with open(
    os.path.join("html", "json_dumps", "charts.json"), "w", encoding="utf-8"
) as result_file:
    result_file.write(result_json)