import re

with open("execution/business-upgrade.html", "r") as f:
    html = f.read()
    
target = """        <!-- 6. HOW WE WORK -->
        <section class="py-24">
            <div class="container mx-auto px-6 max-w-[1100px]">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">Three Ways to Work With Me.</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed">
                        Pick the one that fits your problem and your pace.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div class="bg-surface/50 border border-border/50 p-8 flex flex-col items-center h-full">
                        <h3 class="font-display font-bold text-2xl mb-4 text-offwhite">Advisory</h3>
                        <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                            I sit on your side of the table. You make the calls. I bring the framework, the challenge, and the second opinion. Best when you need a thinking partner, not a pair of hands.
                        </p>
                        <a href="#book" class="bg-accent text-offwhite px-6 py-3 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block w-full">Book a Requirements Call</a>
                    </div>
                    
                    <div class="bg-surface/50 border border-border/50 p-8 flex flex-col items-center h-full">
                        <h3 class="font-display font-bold text-2xl mb-4 text-offwhite">Hands-On</h3>
                        <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                            I join the project. I build the process, fix the structure, and deliver the work alongside your team. Best when you need execution, not just advice.
                        </p>
                        <a href="#book" class="bg-accent text-offwhite px-6 py-3 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block w-full">Book a Requirements Call</a>
                    </div>
                    
                    <div class="bg-surface/50 border border-border/50 p-8 flex flex-col items-center h-full">
                        <h3 class="font-display font-bold text-2xl mb-4 text-offwhite">End-to-End</h3>
                        <p class="text-offwhite/80 leading-relaxed mb-8 flex-grow">
                            I own the outcome. I assemble the team, run the project, and report to you. Best when you need the problem solved without managing it yourself.
                        </p>
                        <a href="#book" class="bg-accent text-offwhite px-6 py-3 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block w-full">Book a Requirements Call</a>
                    </div>
                </div>
            </div>
        </section>"""
        
replacement = """        <!-- 6. HOW WE WORK -->
        <section class="py-24">
            <div class="container mx-auto px-6 max-w-[1100px]">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">Three Ways to Work With Me.</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed">
                        Pick the one that fits your problem and your pace.
                    </p>
                </div>
                
                <!-- PART A - THE GRAPH -->
                <div class="max-w-2xl mx-auto mb-16">
                    <div class="flex items-end h-[300px] border-b border-l border-border/50 pb-0 pl-0 relative px-4 md:px-12 gap-4 md:gap-12">
                        <!-- Y Axis Label -->
                        <div class="absolute top-1/2 -left-12 -translate-y-1/2 origin-center -rotate-90 text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                            Level of Involvement
                        </div>
                        
                        <!-- Bar 1 -->
                        <div class="w-1/3 flex flex-col justify-end h-full">
                            <div class="bg-[#CCCCCC] w-full h-[40%]"></div>
                        </div>
                        <!-- Bar 2 -->
                        <div class="w-1/3 flex flex-col justify-end h-full">
                            <div class="bg-[#1A2332] w-full h-[70%]"></div>
                        </div>
                        <!-- Bar 3 -->
                        <div class="w-1/3 flex flex-col justify-end h-full">
                            <div class="bg-[#E8453C] w-full h-full"></div>
                        </div>
                    </div>
                    
                    <!-- Labels under the bars -->
                    <div class="flex px-4 md:px-12 gap-4 md:gap-12 mt-4 ml-[1px]">
                        <div class="w-1/3 text-center"><span class="text-[10px] md:text-xs font-bold text-offwhite/80 uppercase tracking-widest block">High-Level</span></div>
                        <div class="w-1/3 text-center"><span class="text-[10px] md:text-xs font-bold text-offwhite/80 uppercase tracking-widest block">Collaborative</span></div>
                        <div class="w-1/3 text-center"><span class="text-[10px] md:text-xs font-bold text-accent uppercase tracking-widest block">Hands-On</span></div>
                    </div>
                    
                    <!-- X Axis Label -->
                    <div class="text-right mt-4">
                        <span class="text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest">Time &rarr;</span>
                    </div>
                </div>

                <!-- PART B - THE TABLE -->
                <div class="max-w-5xl mx-auto mb-12">
                    <!-- Desktop Table -->
                    <div class="hidden md:block overflow-hidden border border-border/50">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-charcoal text-offwhite">
                                    <th class="py-4 px-6 font-display font-bold border-b border-border/50">Involvement</th>
                                    <th class="py-4 px-6 font-display font-bold border-b border-border/50">My Team's Role</th>
                                    <th class="py-4 px-6 font-display font-bold border-b border-border/50">Duration</th>
                                    <th class="py-4 px-6 font-display font-bold border-b border-border/50">Who Owns the Outcome</th>
                                    <th class="py-4 px-6 font-display font-bold border-b border-border/50">How You Pay</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white text-charcoal text-sm">
                                <tr class="border-b border-border/20">
                                    <td class="py-4 px-6 font-bold">High-Level</td>
                                    <td class="py-4 px-6">Consultant</td>
                                    <td class="py-4 px-6">Short to medium term</td>
                                    <td class="py-4 px-6">My team</td>
                                    <td class="py-4 px-6 font-medium">Fixed fee</td>
                                </tr>
                                <tr class="border-b border-border/20">
                                    <td class="py-4 px-6 font-bold">Collaborative</td>
                                    <td class="py-4 px-6">Partner and ally</td>
                                    <td class="py-4 px-6">Medium to long term</td>
                                    <td class="py-4 px-6">Both of us</td>
                                    <td class="py-4 px-6 font-medium">Monthly retainer</td>
                                </tr>
                                <tr>
                                    <td class="py-4 px-6 font-bold">Hands-On</td>
                                    <td class="py-4 px-6">Executor and implementer</td>
                                    <td class="py-4 px-6">Long term</td>
                                    <td class="py-4 px-6">My team, with your support</td>
                                    <td class="py-4 px-6 font-medium">Success-linked</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Mobile Cards -->
                    <div class="md:hidden flex flex-col gap-6">
                        <!-- Card 1 -->
                        <div class="bg-white text-charcoal p-6 border border-border/50">
                            <h3 class="font-display font-bold text-xl mb-4 pb-4 border-b border-charcoal/10 uppercase tracking-widest text-accent">High-Level</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">My Team's Role</span>
                                    <span>Consultant</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Duration</span>
                                    <span>Short to medium term</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Who Owns the Outcome</span>
                                    <span>My team</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">How You Pay</span>
                                    <span class="font-medium">Fixed fee</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2 -->
                        <div class="bg-white text-charcoal p-6 border border-border/50">
                            <h3 class="font-display font-bold text-xl mb-4 pb-4 border-b border-charcoal/10 uppercase tracking-widest text-accent">Collaborative</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">My Team's Role</span>
                                    <span>Partner and ally</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Duration</span>
                                    <span>Medium to long term</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Who Owns the Outcome</span>
                                    <span>Both of us</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">How You Pay</span>
                                    <span class="font-medium">Monthly retainer</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 3 -->
                        <div class="bg-white text-charcoal p-6 border border-border/50">
                            <h3 class="font-display font-bold text-xl mb-4 pb-4 border-b border-charcoal/10 uppercase tracking-widest text-accent">Hands-On</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">My Team's Role</span>
                                    <span>Executor and implementer</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Duration</span>
                                    <span>Long term</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">Who Owns the Outcome</span>
                                    <span>My team, with your support</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-charcoal/50 uppercase tracking-widest text-xs mb-1">How You Pay</span>
                                    <span class="font-medium">Success-linked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-center mt-8">
                    <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Requirements Call</a>
                </div>
            </div>
        </section>"""

if target in html:
    new_html = html.replace(target, replacement)
    with open("execution/business-upgrade.html", "w") as f:
        f.write(new_html)
    print("Replaced successfully")
else:
    print("Target not found")
