html = open("execution.html", "r").read()

html = html.replace('M 60 50 C 120 70, 160 180, 336 210 C 450 230, 600 260, 680 265', 
                    'M 60 50 C 120 70, 170 148, 215 148 S 300 210, 370 210 S 600 265, 680 265')

html = html.replace('M 60 260 C 150 250, 200 130, 336 100 C 450 70, 600 40, 680 30',
                    'M 60 260 C 150 250, 250 100, 370 100 S 550 30, 680 30')

# Also, wait, tooltip 2 value is at cx="370" cy="100".
# My new path goes through 370 100? Yes.
# Tooltip 1 cost is at cx="215" cy="148".
# My new path goes through 215 148? Yes.

with open("execution.html", "w") as f:
    f.write(html)
