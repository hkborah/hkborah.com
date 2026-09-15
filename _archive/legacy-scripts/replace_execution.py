import re

html = open("execution.html", "r").read()

new_section = """    <!-- 6. EXECUTION SERVICES -->
    <section class="py-24">
        <div class="container mx-auto px-6 max-w-5xl">
            <div class="text-center mb-16 max-w-3xl mx-auto">
                <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">How We Execute.</h2>
                <p class="text-lg text-offwhite/80 leading-relaxed mb-12">
                    Advice is free. Execution is not. When you are ready to move, we deploy the right team for the job.
                </p>
                
                <h3 class="font-display font-bold text-2xl mb-4 tracking-tight text-offwhite">What Every Growing Business Needs.</h3>
                <p class="text-lg text-offwhite/80 leading-relaxed">
                    There are four things a business needs to keep growing. Two we handle here. Two are handled at PICOVentureLabs. Either way, you get the full picture.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Block 1 -->
                <div class="bg-transparent p-8 md:p-10 border border-offwhite/20 rounded-none flex flex-col items-start text-left">
                    <h3 class="font-display font-bold text-2xl mb-2 text-offwhite">Process and Technology</h3>
                    <p class="text-sm font-bold text-accent uppercase tracking-widest mb-6">How your business operates. Where it leaks time and money.</p>
                    <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                        You are the bottleneck for every decision. Your systems do not talk to each other. Your processes were built for a company half your size. We inject technology, streamline the process, and rebuild the operational structure so the business runs without you in every room.
                    </p>
                    <div class="mt-auto pt-6 border-t border-offwhite/10 w-full">
                        <p class="text-sm text-offwhite/60 mb-4">Handled here. &rarr; <strong class="text-offwhite">Business Upgrade</strong></p>
                        <a href="#" class="font-bold text-accent hover:text-offwhite transition-colors uppercase tracking-widest text-sm inline-block">Explore</a>
                    </div>
                </div>

                <!-- Block 2 -->
                <div class="bg-transparent p-8 md:p-10 border border-offwhite/20 rounded-none flex flex-col items-start text-left">
                    <h3 class="font-display font-bold text-2xl mb-2 text-offwhite">Human Capital</h3>
                    <p class="text-sm font-bold text-accent uppercase tracking-widest mb-6">Who runs your business. Whether they can execute.</p>
                    <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                        A brilliant strategy is useless if the team cannot deliver it. The problem is rarely effort. It is clarity, skill, and structure. We diagnose the gaps, build the capability, and install the rhythm that makes good people perform.
                    </p>
                    <div class="mt-auto pt-6 border-t border-offwhite/10 w-full">
                        <p class="text-sm text-offwhite/60 mb-4">Handled here. &rarr; <strong class="text-offwhite">People Development</strong></p>
                        <a href="#" class="font-bold text-accent hover:text-offwhite transition-colors uppercase tracking-widest text-sm inline-block">Explore</a>
                    </div>
                </div>

                <!-- Block 3 -->
                <div class="bg-transparent p-8 md:p-10 border border-offwhite/20 rounded-none flex flex-col items-start text-left">
                    <h3 class="font-display font-bold text-2xl mb-2 text-offwhite">Capital</h3>
                    <p class="text-sm font-bold text-accent uppercase tracking-widest mb-6">What funds your growth. Equity or debt.</p>
                    <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                        You need money to grow, and raising it is a full-time job. Debt, equity, structured deals, investor relations, term sheets. This is a specialist practice, and it is handled by the team at PICOVentureLabs.
                    </p>
                    <div class="mt-auto pt-6 border-t border-offwhite/10 w-full">
                        <p class="text-sm text-offwhite/60 mb-4">Handled at PICOVentureLabs. &rarr; <strong class="text-offwhite">Fundraising and Deal Advisory</strong></p>
                        <a href="https://thepico.in" target="_blank" rel="noopener noreferrer" class="font-bold text-accent hover:text-offwhite transition-colors uppercase tracking-widest text-sm inline-block">Visit PICOVentureLabs</a>
                    </div>
                </div>

                <!-- Block 4 -->
                <div class="bg-transparent p-8 md:p-10 border border-offwhite/20 rounded-none flex flex-col items-start text-left">
                    <h3 class="font-display font-bold text-2xl mb-2 text-offwhite">Product Innovation</h3>
                    <p class="text-sm font-bold text-accent uppercase tracking-widest mb-6">What you sell next. From concept to production.</p>
                    <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                        Your current product pays the bills. Your next product determines whether you still exist in ten years. Hardware, software, prototypes, manufacturing, vendor selection. This is a build practice, and it is handled by the team at PICOVentureLabs.
                    </p>
                    <div class="mt-auto pt-6 border-t border-offwhite/10 w-full">
                        <p class="text-sm text-offwhite/60 mb-4">Handled at PICOVentureLabs. &rarr; <strong class="text-offwhite">Product Build</strong></p>
                        <a href="https://thepico.in" target="_blank" rel="noopener noreferrer" class="font-bold text-accent hover:text-offwhite transition-colors uppercase tracking-widest text-sm inline-block">Visit PICOVentureLabs</a>
                    </div>
                </div>
            </div>
        </div>
    </section>"""

# Find and replace the section
html = re.sub(r'<!-- 6\. EXECUTION SERVICES -->\s*<section class="py-24">.*?</section>', new_section, html, flags=re.DOTALL)

with open("execution.html", "w") as f:
    f.write(html)
