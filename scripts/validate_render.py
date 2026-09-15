"""Valida o Blueprint com o JSON Schema oficial. Requer requirements-dev.txt."""
import json
from pathlib import Path
from urllib.request import urlopen
import yaml
import jsonschema

root = Path(__file__).resolve().parent.parent
with urlopen('https://render.com/schema/render.yaml.json', timeout=30) as response:
    schema = json.load(response)
data = yaml.safe_load((root / 'render.yaml').read_text(encoding='utf-8'))
jsonschema.validate(data, schema)
print('render.yaml validado com o schema oficial do Render.')
