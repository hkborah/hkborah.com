html = open("execution.html", "r").read()

# Replace text-left with text-center for the tab buttons
html = html.replace('class="tab-btn w-full text-left', 'class="tab-btn w-full text-center')
html = html.replace('class="tab-btn w-full text-center md:text-center', 'class="tab-btn w-full text-center')

# In the script section, also update the active/inactive class updates
html = html.replace("t.className = 'tab-btn w-full text-left", "t.className = 'tab-btn w-full text-center")
html = html.replace("tab.className = 'tab-btn w-full text-left", "tab.className = 'tab-btn w-full text-center")

with open("execution.html", "w") as f:
    f.write(html)
