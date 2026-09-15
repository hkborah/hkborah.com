import re

html = open("execution.html", "r").read()

# Pattern for the SVG container
pattern = r'<div class="max-w-4xl mx-auto mb-16 opacity-0 animate-\[fadeIn_0\.8s_ease-out_forwards\]".*?</div>\s*</div>\s*</div>'

html_new = re.sub(pattern, '', html, flags=re.DOTALL)

with open("execution.html", "w") as f:
    f.write(html_new)
