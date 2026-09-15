with open("execution/business-upgrade.html", "r") as f:
    html = f.read()

html = html.replace(
    '<div class="max-w-2xl mx-auto mb-16">',
    '<div class="max-w-2xl mx-auto mb-16 pl-8 md:pl-12">'
)
html = html.replace(
    '<div class="absolute top-1/2 -left-12 -translate-y-1/2 origin-center -rotate-90 text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">\n                            Level of Involvement\n                        </div>',
    '<div class="absolute inset-y-0 -left-10 md:-left-12 w-10 flex items-center justify-center">\n                            <span class="-rotate-90 whitespace-nowrap text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest">Level of Involvement</span>\n                        </div>'
)

with open("execution/business-upgrade.html", "w") as f:
    f.write(html)
