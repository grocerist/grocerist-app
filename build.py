import os
import glob
import jinja2
import json
import lxml.etree as ET
from acdh_tei_pyutils.tei import TeiReader

templateLoader = jinja2.FileSystemLoader(searchpath=".")
templateEnv = jinja2.Environment(loader=templateLoader)

out_dir = "html"
tei_dir = os.path.join(out_dir, "tei")

with open("project.json", "r", encoding="utf-8") as f:
    project_data = json.load(f)

os.makedirs(out_dir, exist_ok=True)
for x in glob.glob(f"{out_dir}/*.html"):
    os.unlink(x)

files = glob.glob("./templates/static/*.j2")

print("building static content")
for x in files:
    print(x)
    template = templateEnv.get_template(x)
    _, tail = os.path.split(x)
    print(f"rendering {tail}")
    with open(f'./html/{tail.replace(".j2", ".html")}', "w") as f:
        f.write(template.render({"project_data": project_data}))

print("building document sites")
data_file = "documents.json"
template = templateEnv.get_template("./templates/document.j2")
with open(os.path.join("json_dumps", data_file), "r", encoding="utf-8") as f:
    data = json.load(f)
for key, value in data.items():
    f_name = f"{value['grocerist_id']}.html"
    save_path = os.path.join(out_dir, f_name)
    context = {}
    context["object"] = value
    context["page_title"] = value["shelfmark"]
    tei_file = os.path.join(tei_dir, f_name.replace(".html", ".xml"))
    try:
        doc = TeiReader(tei_file)
    except OSError:
        doc = None
        paragraphs = []
        continue
    if doc:
        paragraphs = [
            ET.tostring(x).decode("utf-8") for x in doc.any_xpath(".//tei:body//tei:p")
        ]
    context["paragraphs"] = paragraphs
    if paragraphs:
        context["transcript"] = True
    else:
        context["transcript"] = False
    with open(save_path, "w") as f:
        f.write(template.render(context))


print("building person sites")
data_file = "persons.json"
template = templateEnv.get_template("./templates/person.j2")
with open(os.path.join("json_dumps", data_file), "r", encoding="utf-8") as f:
    data = json.load(f)
for key, value in data.items():
    f_name = f"{value['grocerist_id']}.html"
    save_path = os.path.join(out_dir, f_name)
    context = {}
    context["object"] = value
    context["page_title"] = value["name"]
    with open(save_path, "w") as f:
        f.write(template.render(context))


print("building category sites")
data_file = "categories.json"
template = templateEnv.get_template("./templates/category.j2")
with open(os.path.join("json_dumps", data_file), "r", encoding="utf-8") as f:
    data = json.load(f)
for value in data:
    f_name = f"{value['grocerist_id']}.html"
    save_path = os.path.join(out_dir, f_name)
    context = {}
    context["object"] = value
    context["page_title"] = value["name"]
    with open(save_path, "w") as f:
        f.write(template.render(context))
