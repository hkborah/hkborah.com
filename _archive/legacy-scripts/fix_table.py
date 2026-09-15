with open("execution/business-upgrade.html", "r") as f:
    html = f.read()

html = html.replace('Who Owns the Outcome', 'Who Owns the Execution')

html = html.replace('''<tr class="border-b border-border/20">
                                    <td class="py-4 px-6 font-bold">High-Level</td>
                                    <td class="py-4 px-6">Consultant</td>
                                    <td class="py-4 px-6">Short to medium term</td>
                                    <td class="py-4 px-6">My team</td>
                                    <td class="py-4 px-6 font-medium">Fixed fee</td>
                                </tr>''', '''<tr class="border-b border-border/20">
                                    <td class="py-4 px-6 font-bold">High-Level</td>
                                    <td class="py-4 px-6">Consultant</td>
                                    <td class="py-4 px-6">Short to medium term</td>
                                    <td class="py-4 px-6">Owner and team</td>
                                    <td class="py-4 px-6 font-medium">Fixed fee</td>
                                </tr>''')

html = html.replace('''                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Who Owns the Execution</span>
                                    <span>My team</span>
                                </div>''', '''                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Who Owns the Execution</span>
                                    <span>Owner and team</span>
                                </div>''')


with open("execution/business-upgrade.html", "w") as f:
    f.write(html)
