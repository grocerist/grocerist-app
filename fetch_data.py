import os
import io
import zipfile
import shutil
import requests
import json

github_url = (
    "https://raw.githubusercontent.com/grocerist/grocerist-data/main/json_dumps/"
)

file_list = [
    "categories.json",
    "districts.json",
    "documents.json",
    "goods.json",
    "karye.json",
    "neighbourhoods.json",
    "persons.json",
]

json_dumps = os.path.join("html","json_dumps")


os.makedirs(json_dumps, exist_ok=True)
os.makedirs(os.path.join("html", json_dumps), exist_ok=True)

for x in file_list:
    url = f"{github_url}{x}"
    data = requests.get(url).json()
    save_path = os.path.join(json_dumps, x)
    print(f"downloading {url} and saving it to {save_path}")
    with open(save_path, "w") as fp:
        json.dump(data, fp, ensure_ascii=False)


tei_dir = "tei"
tei_html_dir = os.path.join("html", tei_dir)
zip_file_url = "https://github.com/grocerist/grocerist-tei/archive/refs/heads/main.zip"
shutil.rmtree(tei_html_dir, ignore_errors=True)
os.makedirs(tei_html_dir, exist_ok=True)

r = requests.get(zip_file_url)
z = zipfile.ZipFile(io.BytesIO(r.content))
z.extractall(tei_dir)
for x in os.listdir(f"./{tei_dir}/grocerist-tei-main/tei"):
    shutil.move(os.path.join(f"./{tei_dir}/grocerist-tei-main/tei", x), tei_html_dir)

shutil.rmtree(tei_dir)
