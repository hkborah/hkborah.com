import re

html = open("execution.html", "r").read()

# Fix "Where Are You Stuck?" cards to be centered just in case
html = html.replace('<div class="border border-border/50 p-8 rounded-xl flex flex-col items-center text-center">',
                    '<div class="border border-border/50 p-8 rounded-none flex flex-col items-center text-center">')

# Wait, in the image, the "How We Execute." section cards are completely transparent bg? No, they look like just black background with white borders. `bg-transparent` instead of `bg-surface/30`?
html = html.replace('bg-surface/30 p-8 md:p-10 border border-border/50 rounded-none flex flex-col items-center text-center',
                    'bg-transparent p-8 md:p-10 border border-offwhite/20 rounded-none flex flex-col items-center text-center')

# "Ready to Move?" section button
html = html.replace('<div class="flex justify-center"><a href="#" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a></div>',
                    '<div class="flex justify-center"><a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a></div>')

with open("execution.html", "w") as f:
    f.write(html)
