import re

with open("execution/business-upgrade.html", "r") as f:
    html = f.read()

replacement = """        <!-- 3. THE BUSINESS LOOP -->
        <section class="py-24 bg-surface/30 border-y border-border/50 relative overflow-hidden">
            <div class="container mx-auto px-6 max-w-5xl">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">The Business Loop.</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed">
                        Every business runs on four moves. Most owners are stuck in one of them. We find which one, fix it, and move you forward.
                    </p>
                </div>
                
                <div class="relative py-12 px-8 md:px-16 max-w-4xl mx-auto">
                    <!-- Axis Labels -->
                    <div class="absolute top-0 left-0 right-0 text-center">
                        <span class="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">FUTURE</span>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 text-center">
                        <span class="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">PAST & PRESENT</span>
                    </div>
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 md:w-8">
                        <span class="-rotate-90 text-[10px] font-bold text-muted uppercase tracking-[0.2em] whitespace-nowrap">EXTERNAL</span>
                    </div>
                    <div class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 md:w-8">
                        <span class="rotate-90 text-[10px] font-bold text-muted uppercase tracking-[0.2em] whitespace-nowrap">INTERNAL</span>
                    </div>
                
                    <!-- The Grid -->
                    <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full mt-6 mb-6">
                        <!-- Center Label -->
                        <div class="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-charcoal px-4 py-2 border border-border/50 text-muted uppercase tracking-[0.2em] text-[10px] font-bold z-20">
                            FOCUS
                        </div>
                
                        <!-- Arrows Container -->
                        <div class="hidden md:block absolute inset-0 pointer-events-none z-10">
                            <!-- TL to TR -->
                            <div class="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent text-xl leading-none">&rarr;</div>
                            <!-- BL to BR -->
                            <div class="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent text-xl leading-none">&rarr;</div>
                            
                            <!-- TR to BL Diagonal -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent text-xl leading-none" style="margin-left: -20px; margin-top: 20px;">&swarrow;</div>
                            
                            <!-- BR to TL Diagonal -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent text-xl leading-none" style="margin-left: 20px; margin-top: -20px;">&nwarrow;</div>
                        </div>
                
                        <!-- Panels -->
                        <!-- SEE -->
                        <div class="border border-border/50 p-6 md:p-8 flex flex-col bg-transparent z-10">
                            <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">SEE</h3>
                            <p class="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">WHAT IS HAPPENING?</p>
                            <p class="text-offwhite text-sm leading-relaxed">Market. Competition. Where the industry is going. We look at what is really going on outside the business, before you commit to a move.</p>
                        </div>
                        
                        <!-- DECIDE -->
                        <div class="border border-border/50 p-6 md:p-8 flex flex-col bg-transparent z-10">
                            <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">DECIDE</h3>
                            <p class="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">WHAT IS THE ONE MOVE WORTH MAKING?</p>
                            <p class="text-offwhite text-sm leading-relaxed">We cut the noise. We help you pick the path, price the risk, and drop everything that is not the move.</p>
                        </div>
                
                        <!-- IMPROVE (Bottom-Left) -->
                        <div class="border border-border/50 p-6 md:p-8 flex flex-col bg-transparent z-10 md:order-3">
                            <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">IMPROVE</h3>
                            <p class="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">WHAT CAN WE LEARN?</p>
                            <p class="text-offwhite text-sm leading-relaxed">We measure what moved. We fix what leaked. We feed the result back into the next cycle, so the loop gets faster every time.</p>
                        </div>
                
                        <!-- DO (Bottom-Right) -->
                        <div class="border border-border/50 p-6 md:p-8 flex flex-col bg-transparent z-10 md:order-4">
                            <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">DO</h3>
                            <p class="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">HOW DO WE MAKE IT REAL?</p>
                            <p class="text-offwhite text-sm leading-relaxed">We build the structure. Assign the owners. Set the dates. Turn the decision into execution your team can actually deliver.</p>
                        </div>
                    </div>
                </div>
                
                <div class="text-center mt-12 max-w-3xl mx-auto space-y-6 px-4">
                    <p class="text-lg text-offwhite leading-relaxed">The Business Loop a continuous cycle that moves from SEE-ing what's next to DECIDE-ing the best path, then to DO and execute the plan real), and finally IMPROVE by learning from results.</p>
                    <p class="text-lg text-offwhite leading-relaxed">I fill the gaps in this loop, so that you as the owner can focus on making the final decisions. That is the deal.</p>
                </div>
            </div>
        </section>"""

pattern = r'<!-- 3\. THE BUSINESS LOOP -->.*?</section>'
new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)

with open("execution/business-upgrade.html", "w") as f:
    f.write(new_html)
