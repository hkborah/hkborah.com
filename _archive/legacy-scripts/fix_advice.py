import re

def read_file(path):
    with open(path, 'r') as f: return f.read()

def write_file(path, content):
    with open(path, 'w') as f: f.write(content)

advice = read_file('advice.html')
index = read_file('index.html')

# Extract script from index.html
script_match = re.search(r'<!-- Chat Logic -->(.*?)</body>', index, re.DOTALL)
if script_match:
    chat_script = "<!-- Chat Logic -->\n" + script_match.group(1).strip()
    
    # Replace the script section in advice.html
    advice = re.sub(
        r'<!-- SCRIPT SECTION -->.*?</body>',
        chat_script + '\n</body>',
        advice,
        flags=re.DOTALL
    )

# Now fix the FAQ section (Section 9)
faq_replacement = '''
        <!-- 9. FAQs -->
        <section class="py-24 px-6 lg:px-12 bg-surface/30 border-b border-border/50">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="font-display font-bold text-4xl tracking-tight text-accent">FAQs.</h2>
                </div>
                <div class="space-y-4">
                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            Is this really free?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            Yes. No signup, no card, no pitch. Ask anything you want. We ask only that you use it honestly. The twin runs on a prepaid budget. When the budget runs out, the door closes for the day. If usage grows beyond what we can sustain, we will let you know before anything changes.
                        </div>
                    </details>

                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            Does the twin save my conversations?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            Nothing you type is stored on my server unless you press Save. If you press Save, you get a copy for your records, and a copy is stored for my personal use only. No personal data is captured, and nothing is shared with anyone else.
                        </div>
                    </details>

                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            Is my data used for training?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            Your conversations are not used to train public models. They help us improve the twin's answers over time. They are not shared with third parties.
                        </div>
                    </details>

                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            What if the twin does not know the answer?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            It will tell you. It will not bluff. If your question is outside its knowledge, it will say so and suggest you book a call.
                        </div>
                    </details>

                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            Is this legal or professional advice?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            No. The twin gives general business advice based on published frameworks. It does not know your specific facts, your legal exposure, or your financial position. It is not a substitute for a formal engagement or a licensed professional. If the answer matters, book a requirements call so we can scope a proper solution.
                        </div>
                    </details>

                    <details class="group border-b border-border/50 pb-4 mb-4">
                        <summary class="cursor-pointer font-display font-bold text-xl text-accent flex justify-between items-center">
                            Where can I read your frameworks in more depth?
                            <span class="text-accent group-open:rotate-180 transition-transform duration-300">&#9660;</span>
                        </summary>
                        <div class="pt-4 text-offwhite/80 leading-relaxed text-sm font-light">
                            I have published three books. The Order of Chaos covers the founder stage. Last Firefighter covers the mid-sized business stage. VEGA covers the enterprise governance stage. All three are at hkborah.com/books.
                        </div>
                    </details>
                </div>
            </div>
        </section>
'''

advice = re.sub(
    r'<!-- 9\. QUESTIONS -->.*?<!-- 10\. THE CLOSE -->',
    faq_replacement + '\n<!-- 10. THE CLOSE -->',
    advice,
    flags=re.DOTALL
)

write_file('advice.html', advice)
