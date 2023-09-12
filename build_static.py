import os
import glob
import jinja2
import json

templateLoader = jinja2.FileSystemLoader(searchpath=".")
templateEnv = jinja2.Environment(loader=templateLoader)

out_dir = "html"

os.makedirs(out_dir, exist_ok=True)
for x in glob.glob(f'{out_dir}/*.html'):
    os.unlink(x)

files = glob.glob('./templates/static/*.j2')

print('building static content')
for x in files:
    print(x)
    template = templateEnv.get_template(x)
    _, tail = os.path.split(x)
    # print(f'rendering {tail}')
    with open(f'./html/{tail.replace(".j2", ".html")}', 'w') as f:
        f.write(template.render({"objects": {}}))

print("building document sites")

data_file = "documents.json"

template = templateEnv.get_template("./templates/document.j2")

with open(os.path.join("json_dumps", data_file), "r", encoding="utf-8") as f:
    documents_data = json.load(f)

for key, value in documents_data.items():
    f_name = f"{value['grocerist_id']}.html"
    save_path = os.path.join(out_dir, f_name)
    context = {}
    context["object"] = value
    context["page_title"] = value["shelfmark"]
    with open(save_path, "w") as f:
        f.write(template.render(context))