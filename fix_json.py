import re
with open('package.json', 'r') as f:
    text = f.read()

text = text.replace('  }\n}', '}')
with open('package.json', 'w') as f:
    f.write(text)
