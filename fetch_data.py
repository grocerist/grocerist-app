import os
import shutil
import requests
import json

github_url = (
    "https://raw.githubusercontent.com/grocerist/grocerist-data/main/json_dumps/"
)

file_list = [
    "category.json",
    "districts.json",
    "documents.json",
    "goods.json",
    "karye.json",
    "neighbourhoods.json",
    "persons.json",
]

json_dumps = "json_dumps"


os.makedirs(json_dumps, exist_ok=True)
os.makedirs(os.path.join("html", json_dumps), exist_ok=True)

for x in file_list:
    url = f"{github_url}{x}"
    data = requests.get(url).json()
    save_path = os.path.join(json_dumps, x)
    print(f"downloading {url} and saving it to {save_path}")
    with open(save_path, "w") as fp:
        json.dump(data, fp, ensure_ascii=False)
    shutil.copy(src=save_path, dst=os.path.join("html", json_dumps, x))
