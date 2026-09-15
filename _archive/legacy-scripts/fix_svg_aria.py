html = open("execution.html", "r").read()

# Add role="img" and aria-label to the tooltip triggers
html = html.replace('<g class="tooltip-trigger" style="cursor: crosshair;">', 
                    '<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Interactive chart data point">')

# More specific aria-labels
html = html.replace('<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Interactive chart data point">\n                    <circle cx="163"',
                    '<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Cost of AI deployment decreases: Initial cost drops as manual work shifts to AI">\n                    <circle cx="163"')

html = html.replace('<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Interactive chart data point">\n                    <circle cx="336"',
                    '<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Value realization increases: Output increases linearly without headcount">\n                    <circle cx="336"')

html = html.replace('<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Interactive chart data point">\n                    <circle cx="680"',
                    '<g class="tooltip-trigger" style="cursor: crosshair;" role="img" aria-label="Steady state: Marginal cost of execution approaches zero">\n                    <circle cx="680"')

with open("execution.html", "w") as f:
    f.write(html)
