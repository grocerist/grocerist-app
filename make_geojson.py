import os
import json

with open(
    os.path.join("html", "json_dumps", "districts.json"), "r", encoding="utf-8"
) as fp:
    data = json.load(fp)

geo_json = {"type": "FeatureCollection", "features": []}


for key, value in data.items():
    if value["lat"]:
        gj_feature = {
            "type": "Feature",
            "geometry": {"type": "Point"},
            "properties": {},
        }
        gj_feature["geometry"]["coordinates"] = [
            float(value["long"]),
            float(value["lat"]),
        ]
        gj_feature["properties"]["name"] = value["name"]
        gj_feature["properties"]["grocerist_id"] = value["grocerist_id"]
        gj_feature["properties"]["doc_count"] = len(value["documents"])
        gj_feature["properties"]["person_count"] = len(value["persons"])

        geo_json["features"].append(gj_feature)

with open(
    os.path.join("html", "json_dumps", "gj_districts.json"), "w", encoding="utf-8"
) as fp:
    json.dump(geo_json, fp, ensure_ascii=False)

#duplicate just to test 
with open(
    os.path.join("html", "json_dumps", "neighbourhoods.json"), "r", encoding="utf-8"
) as fp:
    data = json.load(fp)

geo_json = {"type": "FeatureCollection", "features": []}


for key, value in data.items():
    if value["latitude"]:
        gj_feature = {
            "type": "Feature",
            "geometry": {"type": "Point"},
            "properties": {},
        }
        gj_feature["geometry"]["coordinates"] = [
            float(value["longitute"]),
            float(value["latitude"]),
        ]
        gj_feature["properties"]["name"] = value["name"]
        gj_feature["properties"]["grocerist_id"] = value["grocerist_id"]
        gj_feature["properties"]["doc_count"] = len(value["documents"])
        gj_feature["properties"]["person_count"] = len(value["persons"])

        geo_json["features"].append(gj_feature)

with open(
    os.path.join("html", "json_dumps", "gj_neighbourhoods.json"), "w", encoding="utf-8"
) as fp:
    json.dump(geo_json, fp, ensure_ascii=False)
