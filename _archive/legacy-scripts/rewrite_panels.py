import re

html = open("execution.html", "r").read()

panels_html = """
                <!-- Panel 1: The Bottleneck -->
                <div id="panel-1" role="tabpanel" aria-labelledby="tab-1" class="tab-panel">
                    <div class="max-w-3xl mb-12 text-center mx-auto">
                        <h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">You are spending more time <span class="text-offwhite">IN</span> the business than <span class="text-offwhite">ON</span> the business.</h3>
                        <p class="text-lg text-offwhite/80 leading-relaxed">
                            You became the central hub for every decision. Your team waits for you. Your calendar is full. The strategic thinking that built this business has no room left to breathe. This is not a failure. It is a signal. It is time to fix the structure.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
                        <!-- Card 1 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M18 20V10M12 20V4M6 20v-4" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Analysis</h4>
                            <p class="text-offwhite/80 leading-relaxed">We look at where your time and energy are leaking. We map your daily operations. We identify the decisions only you can make and the ones your team should be making. We find the bottleneck.</p>
                        </div>
                        <!-- Card 2 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M9 18h6M10 21h4M12 2a6 6 0 0 1 6 6c0 3.5-3 5-3 8v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1c0-3-3-4.5-3-8a6 6 0 0 1 6-6z" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Solution</h4>
                            <p class="text-offwhite/80 leading-relaxed">We design a structure that runs without you in every room. We build a delegation framework, a decision-making system, and a reporting rhythm. Your team gets clarity. You get your time back.</p>
                        </div>
                        <!-- Card 3 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Plan</h4>
                            <p class="text-offwhite/80 leading-relaxed">We give you a step-by-step roadmap. We tell you what to fix first, what to fix next, and what to leave alone. No confusion. No guesswork.</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-center">
                        <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a>
                    </div>
                </div>

                <!-- Panel 2: The Relevance Risk -->
                <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" class="tab-panel hidden">
                    <div class="max-w-3xl mb-12 text-center mx-auto">
                        <h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">Your <span class="text-offwhite">industry</span> is changing <span class="text-offwhite">faster</span> than your business.</h3>
                        <p class="text-lg text-offwhite/80 leading-relaxed">
                            Technology is shifting. Customer expectations are shifting. Competitors are moving. If you are too buried in daily operations to see what is coming, you will wake up one day and realize the market has left you behind. This is not a technology problem. It is a leadership bandwidth problem.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
                        <!-- Card 1 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="M21 21l-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Assess</h4>
                            <p class="text-offwhite/80 leading-relaxed">We study your industry, your competitors, and your technology. We tell you the honest truth: are you ahead, behind, or on track?</p>
                        </div>
                        <!-- Card 2 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Adapt</h4>
                            <p class="text-offwhite/80 leading-relaxed">We figure out what needs to change. We integrate modern tools and re-align your operational structure with what the market actually demands today.</p>
                        </div>
                        <!-- Card 3 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Future-Proof</h4>
                            <p class="text-offwhite/80 leading-relaxed">We build agility into your foundation. We don't just solve today's problems; we design a system that proactively adapts to tomorrow's shifts.</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-center">
                        <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a>
                    </div>
                </div>

                <!-- Panel 3: The Untapped Opportunity -->
                <div id="panel-3" role="tabpanel" aria-labelledby="tab-3" class="tab-panel hidden">
                    <div class="max-w-3xl mb-12 text-center mx-auto">
                        <h3 class="font-display font-bold text-3xl mb-4 tracking-tight text-accent">You are <span class="text-offwhite">leaving</span> <span class="text-offwhite">money</span> on the table.</h3>
                        <p class="text-lg text-offwhite/80 leading-relaxed">
                            There is a product you have not launched. A process that is bleeding cash. A market you have not entered. A team member who is capable of more but has no direction. Every day spent firefighting is a day lost to opportunity. The structure must change.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
                        <!-- Card 1 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M10 6h10M10 12h10M10 18h10M4 6h.01M4 12h.01M4 18h.01" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Prioritize</h4>
                            <p class="text-offwhite/80 leading-relaxed">We list everything you could do. Then we rank them by profit, effort, and speed. We tell you which one to start with and which ones to ignore.</p>
                        </div>
                        <!-- Card 2 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M12 22v-8M12 14c-4 0-6-3-6-6 4 0 6 3 6 6zm0 0c4 0 6-3 6-6-4 0-6 3-6 6zM12 22h-4m4 0h4" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Incubate</h4>
                            <p class="text-offwhite/80 leading-relaxed">We test the idea with minimum cost and minimum risk. We learn what works before we commit serious money. No big bets without proof.</p>
                        </div>
                        <!-- Card 3 -->
                        <div class="bg-transparent border border-offwhite/20 p-8 rounded-none flex flex-col items-center text-center">
                            <svg class="w-8 h-8 mb-6 icon-stroke" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none">
                                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.5-.5m5.5-5.5l5.5-5.5a2.121 2.121 0 00-3-3l-5.5 5.5m-3.5 1.5l1.5 1.5m3.5-3.5l1.5 1.5m-1 7l3.5-3.5-7-7-3.5 3.5c-.86.86-1.5 2.1-1.5 3.5v.5l-2.5 2.5 1 1 2.5-2.5h.5c1.4 0 2.64-.64 3.5-1.5z" stroke-width="2"/>
                            </svg>
                            <h4 class="font-display font-bold text-xl mb-3">Launch</h4>
                            <p class="text-offwhite/80 leading-relaxed">We build the go-to-market plan, the sales pitch, and the delivery model. We do not just launch it. We make it profitable.</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-center">
                        <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Call</a>
                    </div>
                </div>
"""

start_marker = '<!-- Panel 1: The Bottleneck -->'
end_marker = '</section>'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + panels_html + "\n            </div>\n        </div>\n    " + html[end_idx:]
    with open("execution.html", "w") as f:
        f.write(new_html)
else:
    print("Could not find boundaries")
