import re

html = open("execution.html", "r").read()

# Pattern for the inserted SVG block
svg_pattern = r'<div class="max-w-4xl mx-auto mb-16 opacity-0 animate-\[fadeIn_0\.8s_ease-out_forwards\]" style="animation-delay: 0\.2s;">.*?</div>\s*</div>\s*</div>'

# Verify what we are replacing
html_new = re.sub(svg_pattern, '', html, flags=re.DOTALL)

# Pattern for the inserted CSS
css_pattern = r'\s*@keyframes fadeIn \{\s*from \{ opacity: 0; transform: translateY\(10px\); \}\s*to \{ opacity: 1; transform: translateY\(0\); \}\s*\}'
html_new = re.sub(css_pattern, '', html_new)

with open("execution.html", "w") as f:
    f.write(html_new)

