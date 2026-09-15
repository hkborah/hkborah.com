html = open("execution.html", "r").read()
import re
match = re.search(r'id="panel-1".*?id="panel-2"', html, re.DOTALL)
if match:
    print(match.group(0))
