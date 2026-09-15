html = open("execution.html", "r").read()

# Replace X coordinates
html = html.replace('x1="163"', 'x1="215"')
html = html.replace('x2="163"', 'x2="215"')
html = html.replace('x="163"', 'x="215"')
html = html.replace('cx="163"', 'cx="215"')

html = html.replace('x1="336"', 'x1="370"')
html = html.replace('x2="336"', 'x2="370"')
html = html.replace('x="336"', 'x="370"')
html = html.replace('cx="336"', 'cx="370"')

html = html.replace('x1="509"', 'x1="525"')
html = html.replace('x2="509"', 'x2="525"')
html = html.replace('x="509"', 'x="525"')
html = html.replace('cx="509"', 'cx="525"')

with open("execution.html", "w") as f:
    f.write(html)
