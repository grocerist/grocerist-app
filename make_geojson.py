import os
import json


def make_geojson(json_file):
    with open(
        os.path.join("html", "json_dumps", json_file), "r", encoding="utf-8"
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
        os.path.join("html", "json_dumps", "gj_" + json_file), "w", encoding="utf-8"
    ) as fp:
        json.dump(geo_json, fp, ensure_ascii=False)


make_geojson("districts.json")
make_geojson("neighbourhoods.json")
