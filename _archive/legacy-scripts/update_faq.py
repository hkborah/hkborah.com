import re

html = open("advice.html", "r").read()

new_faq = """<div class="max-w-3xl mx-auto space-y-8">
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Is this really free?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Yes. No signup, no card, no pitch. Ask anything you want. We ask only that you use it honestly. The twin runs on a prepaid budget. When the budget runs out, the door closes for the day. If usage grows beyond what we can sustain, we will let you know before anything changes.</p>
                    </div>
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Is my conversation saved?</h3>
                        <p class="text-offwhite/80 leading-relaxed">No, not by default. Nothing is stored on our servers while you are chatting. Your conversation exists only in your browser. If you press Save, two things happen: you get a PDF copy for your own records, and a copy is stored on hkborah.com for H.K. Borah's personal research only. No personal data is captured with it. No contact details. Nothing for marketing. Nothing shared with anyone other than H.K. Borah himself.</p>
                    </div>
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Is my data used for training?</h3>
                        <p class="text-offwhite/80 leading-relaxed">No. Your conversation is not used to train any public model, and it is not shared with any third party. If you press Save, a copy is stored for H.K. Borah's personal research only.</p>
                    </div>

                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">What if the twin does not know the answer?</h3>
                        <p class="text-offwhite/80 leading-relaxed">It will tell you. It will not bluff. If your question is outside its knowledge, it will say so and suggest you book a call.</p>
                    </div>

                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Is this legal or professional advice?</h3>
                        <p class="text-offwhite/80 leading-relaxed">No. The twin gives general business advice based on published frameworks. It does not know your specific facts, your legal exposure, or your financial position. It is not a substitute for a formal engagement or a licensed professional. If the answer matters, book a requirements call so we can scope a proper solution.</p>
                    </div>

                    <div class="pb-4">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Where can I read your frameworks in more depth?</h3>
                        <p class="text-offwhite/80 leading-relaxed">I have published three books. The Order of Chaos covers the founder stage. Last Firefighter covers the mid-sized business stage. VEGA covers the enterprise governance stage. All three are at hkborah.com/books.</p>
                    </div>

                </div>"""

# Replace everything from <div class="max-w-3xl mx-auto space-y-8"> to the closing </div> before </div>\n        </section>
html = re.sub(r'<div class="max-w-3xl mx-auto space-y-8">.*?</div>\n            </div>\n        </section>', new_faq + '\n            </div>\n        </section>', html, flags=re.DOTALL)

with open("advice.html", "w") as f:
    f.write(html)
