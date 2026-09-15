import re

html = open("execution.html", "r").read()

# 1. Be Honest With Yourself - List items
html = re.sub(
    r'<li class="flex items-start">',
    r'<li class="flex flex-col items-center text-center">',
    html
)
# And make the dots centered above the text instead of beside? 
# In the image, the dot is beside the text. But the text wraps. 
# Wait, if we use `flex items-start text-center`, wait, flex row with `items-start` makes the text left aligned unless the container justifies center.
# If we do `flex items-center justify-center text-center`, it will center.
html = html.replace('<li class="flex flex-col items-center text-center">', '<li class="flex items-start justify-center text-center">')

# Let's actually check how it looks. If they want the dot on the left, it should be:
html = html.replace('<li class="flex items-start justify-center text-center">', '<li class="flex items-start justify-center text-center">')

# 2. How We Execute - Cards
# <div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-lg">
html = html.replace('<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-lg">', 
                    '<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-none flex flex-col items-center text-center">')
html = html.replace('max-w-2xl">', 'max-w-2xl mx-auto">')

# "Ready to Move" section
# The button might be left aligned?
html = html.replace('<a href="#" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none text-center text-lg">Book a Call</a>',
                    '<div class="flex justify-center"><a href="#" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a></div>')

with open("execution.html", "w") as f:
    f.write(html)
