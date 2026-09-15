html = open("execution.html", "r").read()

# Tooltip 1 (Cost)
html = html.replace('<text x="175" y="140" font-family="Inter" font-size="7.5"', '<text x="227" y="140" font-family="Inter" font-size="7.5"')
html = html.replace('<rect x="150" y="90" width="160" height="40" fill="#1A1A1A" rx="4" />', '<rect x="202" y="90" width="160" height="40" fill="#1A1A1A" rx="4" />')
html = html.replace('<text x="160" y="108" font-family="Inter"', '<text x="212" y="108" font-family="Inter"')
html = html.replace('<text x="160" y="122" font-family="Inter"', '<text x="212" y="122" font-family="Inter"')

# Tooltip 2 (Value)
html = html.replace('<text x="320" y="85" font-family="Inter" font-size="7.5"', '<text x="354" y="85" font-family="Inter" font-size="7.5"')
html = html.replace('<rect x="166" y="45" width="160" height="40" fill="#1A1A1A" rx="4" />', '<rect x="200" y="45" width="160" height="40" fill="#1A1A1A" rx="4" />')
html = html.replace('<text x="176" y="63" font-family="Inter"', '<text x="210" y="63" font-family="Inter"')
html = html.replace('<text x="176" y="77" font-family="Inter"', '<text x="210" y="77" font-family="Inter"')

with open("execution.html", "w") as f:
    f.write(html)
