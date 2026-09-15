html = open("execution.html", "r").read()
old_str = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight">You are spending more time IN the business than ON the business.</h3>'
new_str = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">You are spending more time <span class="text-offwhite">IN</span> the business than <span class="text-offwhite">ON</span> the business.</h3>'
html = html.replace(old_str, new_str)
with open("execution.html", "w") as f:
    f.write(html)
