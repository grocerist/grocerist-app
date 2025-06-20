import os
import glob
import jinja2
import json
import requests
import lxml.etree as ET
from acdh_tei_pyutils.tei import TeiReader
import subprocess
import locale

# Run additional scripts to generate or update json files
helper_scripts = "json_pyscripts"
for script in os.listdir(helper_scripts):
    path = os.path.join(helper_scripts, script)
    print(f"running {path}")
    subprocess.run(["python", path])

templateLoader = jinja2.FileSystemLoader(searchpath=".")
templateEnv = jinja2.Environment(
    loader=templateLoader, trim_blocks=True, lstrip_blocks=True
)

nsmap = {
    "tei": "http://www.tei-c.org/ns/1.0",
}
gh_img_data = (
    "https://raw.githubusercontent.com/grocerist/transkribus-out/main/data.json"
)

img_data = requests.get(gh_img_data).json()
out_dir = "html"
json_dumps = os.path.join(out_dir, "json_dumps")
tei_dir = os.path.join(out_dir, "tei")

with open("project.json", "r", encoding="utf-8") as f:
    project_data = json.load(f)

# get imprint
redmine_id = project_data["redmine_id"]
imprint_url = f"https://imprint.acdh.oeaw.ac.at/{redmine_id}?locale=en"
print(imprint_url)
try:
    r = requests.get(imprint_url, timeout=2)
    project_data["imprint"] = r.content.decode("utf-8")
except Exception as e:
    project_data["imprint"] = (
        """Due to temporary technical difficulties, the legal notice for this website cannot be displayed.
        <br> However, general information can be found
          in the imprint of the <a href="https://www.oeaw.ac.at/en/oeaw/imprint">Austrian Academy of Sciences</a>."""
    )
    print(e)

os.makedirs(out_dir, exist_ok=True)
for x in glob.glob(f"{out_dir}/*.html"):
    os.unlink(x)

all_templates = templateEnv.list_templates(extensions=".j2")
files = [
    template for template in all_templates if template.startswith("templates/static")
]


def render_static_page(template_path, output_path, extra_context=None):
    template = templateEnv.get_template(template_path)
    context = {"project_data": project_data}
    if extra_context:
        context.update(extra_context)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(template.render(context))


def sort_and_group_glossary(glossary_data):
    glossary_terms = {
        entry["term"]: entry["long_text"] for entry in glossary_data.values()
    }
    locale.setlocale(locale.LC_COLLATE, "tr_TR.utf8")
    sorted_terms = sorted(glossary_terms.items(), key=lambda x: locale.strxfrm(x[0]))
    grouped = {}
    for term, definition in sorted_terms:
        letter = term[0].upper()
        grouped.setdefault(letter, []).append((term, definition))
    return grouped


print("building static content")
for x in files:
    print(x)
    _, tail = os.path.split(x)
    print(f"rendering {tail}")
    output_path = os.path.join("html", tail.replace(".j2", ".html"))
    extra_context = None
    if x == "templates/static/glossary.j2":
        data_file = "glossary.json"
        with open(os.path.join(json_dumps, data_file), "r", encoding="utf-8") as f:
            glossary_data = json.load(f)
            grouped_glossary = sort_and_group_glossary(glossary_data)
        extra_context = {"glossary_data": grouped_glossary}
    render_static_page(x, output_path, extra_context)

print("building document sites")
data_file = "documents.json"
template = templateEnv.get_template("./templates/document.j2")

with open(os.path.join(json_dumps, data_file), "r", encoding="utf-8") as f:
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
    if doc:
        paragraphs = []
        for p in doc.any_xpath(".//tei:body//tei:p"):
            parent_div = p.getparent()
            if (
                parent_div.tag == "{http://www.tei-c.org/ns/1.0}div"
                and parent_div.get("type") == "section"
                and parent_div.xpath(
                    f".//*[@target='http://{value['grocerist_id']}']", namespaces=nsmap
                )
            ):
                p.set("class", "fw-bold")
            paragraphs.append(ET.tostring(p).decode("utf-8"))
    context["paragraphs"] = paragraphs
    if paragraphs:
        context["transcript"] = True
        value["transcript"] = True
    else:
        context["transcript"] = False
        value["transcript"] = False
    try:
        context["images"] = [
            f"https://files.transkribus.eu/iiif/2/{x}/info.json"
            for x in img_data[value["doc_id"]]
        ]
        value["images"] = True
    except KeyError:
        context["images"] = False
        value["images"] = False
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(template.render(context))
with open(os.path.join(json_dumps, data_file), "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

print("building category sites")
data_file = "categories.json"
template = templateEnv.get_template("./templates/category.j2")
with open(os.path.join(json_dumps, data_file), "r", encoding="utf-8") as f:
    data = json.load(f)
for key, value in data.items():
    f_name = f"{value['grocerist_id']}.html"
    save_path = os.path.join(out_dir, f_name)
    context = {}
    context["object"] = value
    context["page_title"] = value["name"]
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(template.render(context))


def buildSites(subpage, jsonFile, templateFile):
    print(f"building {subpage} sites")
    data_file = jsonFile
    template = templateEnv.get_template(templateFile)
    with open(os.path.join(json_dumps, data_file), "r", encoding="utf-8") as f:
        data = json.load(f)
    for key, value in data.items():
        f_name = f"{value['grocerist_id']}.html"
        save_path = os.path.join(out_dir, f_name)
        context = {}
        context["object"] = value
        context["page_title"] = value["name"]
        with open(save_path, "w", encoding="utf-8") as f:
            f.write(template.render(context))


subpages = [
    ("person", "persons.json", "./templates/person.j2"),
    ("district", "districts.json", "./templates/district.j2"),
    ("neighbourhood", "neighbourhoods.json", "./templates/neighbourhood.j2"),
    ("good", "goods.json", "./templates/good.j2"),
    ("karye", "karye.json", "./templates/karye.j2"),
    ("nahiye", "nahiye.json", "./templates/nahiye.j2"),
    ("quarter", "quarter.json", "./templates/quarter.j2"),
    ("address", "address.json", "./templates/address.j2"),
    ("utensil", "utensils.json", "./templates/utensil.j2"),
]

for data in subpages:
    buildSites(*data)
