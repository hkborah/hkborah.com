html = open("execution.html", "r").read()
html = html.replace('Learn More &rarr;', 'LEARN MORE ...')
with open("execution.html", "w") as f:
    f.write(html)
