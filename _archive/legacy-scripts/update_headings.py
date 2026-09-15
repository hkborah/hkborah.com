html = open("execution.html", "r").read()

old_1 = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight">Your industry is changing faster than your business.</h3>'
new_1 = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">Your <span class="text-offwhite">industry</span> is changing <span class="text-offwhite">faster</span> than your business.</h3>'

old_2 = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight">You are leaving money on the table.</h3>'
new_2 = '<h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">You are <span class="text-offwhite">leaving</span> <span class="text-offwhite">money</span> on the table.</h3>'

html = html.replace(old_1, new_1)
html = html.replace(old_2, new_2)

with open("execution.html", "w") as f:
    f.write(html)
