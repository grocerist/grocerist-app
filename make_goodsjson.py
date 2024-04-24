import os
import json


def read_json_file(file_name):
    with open(
        os.path.join("html", "json_dumps", file_name), "r", encoding="utf-8"
    ) as file:
        data = json.load(file)
        return data

goods_data = read_json_file("goods.json")
docs_data = read_json_file("documents.json")

for key, value in goods_data.items():
    if (value["documents"]):
        for doc in value["documents"]:
            doc['lat'] = docs_data[str(doc["id"])].get("lat")
            doc['long'] = docs_data[str(doc["id"])].get("long")

with open(
    os.path.join("html", "json_dumps", "goods2.json"), "w", encoding="utf-8"
) as result_file:
    goods_data = json.dumps(goods_data)
    result_file.write(goods_data)