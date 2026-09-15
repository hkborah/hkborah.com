import re

html = open("execution.html", "r").read()

def clean_panel(match):
    content = match.group(0)
    # find the end of the grid
    grid_end = content.find('</div>', content.find('<div class="grid'))
    if grid_end != -1:
        # include the closing div of the grid
        cleaned = content[:grid_end+6]
        # add the CTA button and the closing div of the panel
        cta = '\n                    <div class="flex justify-center">\n                        <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a>\n                    </div>\n                </div>'
        return cleaned + cta
    return content

# We need to match each panel exactly.
# panel 1: from <div id="panel-1"... to the start of <!-- Panel 2
html = re.sub(r'<div id="panel-1".*?(?=<!-- Panel 2)', clean_panel, html, flags=re.DOTALL)
html = re.sub(r'<div id="panel-2".*?(?=<!-- Panel 3)', clean_panel, html, flags=re.DOTALL)
html = re.sub(r'<div id="panel-3".*?(?=</div>\s*</div>\s*</section>)', clean_panel, html, flags=re.DOTALL)

with open("execution.html", "w") as f:
    f.write(html)
