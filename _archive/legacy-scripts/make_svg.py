import re

svg_code = """
<div class="max-w-4xl mx-auto mb-16 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]" style="animation-delay: 0.2s;">
    <div class="bg-white p-8 border border-[#404040] rounded-none overflow-hidden relative" style="font-family: 'Inter', sans-serif;">
        <!-- Header / Stat Cards -->
        <div class="flex justify-between items-start mb-8">
            <div>
                <h4 class="font-display font-bold text-xl text-black tracking-tight mb-1">Execution Velocity vs Cost</h4>
                <p class="text-[#C7C7C7] text-xs uppercase tracking-widest">Projected Impact over 4 Quarters</p>
            </div>
            <div class="flex gap-4">
                <!-- Stat Card 1 -->
                <div class="w-[292px] h-[88px] border border-[#404040] rounded-[8px] flex items-center px-6 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]" style="animation-delay: 0.4s;">
                    <div class="text-[#D45D3A] font-display font-bold text-4xl mr-4" style="letter-spacing: -1px;">-68%</div>
                    <div class="flex flex-col justify-center">
                        <div class="text-[#C7C7C7] uppercase text-[7.5px] tracking-[1.5px] leading-tight">Reduction in</div>
                        <div class="text-[#C7C7C7] uppercase text-[7.5px] tracking-[1.5px] leading-tight">Deployment Cost</div>
                    </div>
                </div>
                <!-- Stat Card 2 -->
                <div class="w-[292px] h-[88px] border border-[#404040] rounded-[8px] flex items-center px-6 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]" style="animation-delay: 0.6s;">
                    <div class="text-black font-display font-bold text-4xl mr-4" style="letter-spacing: -1px;">4.2x</div>
                    <div class="flex flex-col justify-center">
                        <div class="text-[#C7C7C7] uppercase text-[7.5px] tracking-[1.5px] leading-tight">Increase in</div>
                        <div class="text-[#C7C7C7] uppercase text-[7.5px] tracking-[1.5px] leading-tight">Execution Speed</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SVG Chart Area -->
        <div class="relative w-full opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]" style="animation-delay: 0.8s; height: 320px;">
            <style>
                .chart-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1.5s ease-out forwards; }
                .chart-line-delay { animation-delay: 1.2s; }
                @keyframes drawLine { to { stroke-dashoffset: 0; } }
                .tooltip-trigger:hover .tooltip-target { opacity: 1; transform: translateY(0); }
                .tooltip-target { transition: all 0.2s ease-out; pointer-events: none; }
            </style>
            <svg viewBox="0 0 700 320" width="100%" height="100%" class="overflow-visible">
                <!-- Background -->
                <rect width="700" height="320" fill="white" />
                
                <!-- Grid Lines (dashed, 32% opacity coral = rgba(212, 93, 58, 0.32) or just use stroke="#D45D3A" stroke-opacity="0.32") -->
                <g stroke="#D45D3A" stroke-opacity="0.32" stroke-dasharray="4,4" stroke-width="1">
                    <line x1="60" y1="40" x2="680" y2="40" />
                    <line x1="60" y1="100" x2="680" y2="100" />
                    <line x1="60" y1="160" x2="680" y2="160" />
                    <line x1="60" y1="220" x2="680" y2="220" />
                    <line x1="60" y1="280" x2="680" y2="280" />
                    
                    <line x1="163" y1="40" x2="163" y2="280" />
                    <line x1="336" y1="40" x2="336" y2="280" />
                    <line x1="509" y1="40" x2="509" y2="280" />
                    <line x1="680" y1="40" x2="680" y2="280" />
                </g>
                
                <!-- Y-Axis & X-Axis solid lines (titanium grey) -->
                <g stroke="#404040" stroke-width="1">
                    <line x1="60" y1="40" x2="60" y2="280" />
                    <line x1="60" y1="280" x2="680" y2="280" />
                </g>
                
                <!-- Y-Axis Labels -->
                <g font-family="Inter" font-size="7.5" fill="#C7C7C7" text-anchor="end" letter-spacing="1.5">
                    <text x="50" y="43">100</text>
                    <text x="50" y="103">75</text>
                    <text x="50" y="163">50</text>
                    <text x="50" y="223">25</text>
                    <text x="50" y="283">0</text>
                </g>
                <!-- Y-Axis Rotated Title -->
                <text x="-160" y="20" font-family="Inter" font-size="7.5" fill="#404040" transform="rotate(-90)" letter-spacing="2" font-weight="bold">RELATIVE EFFORT / COST INDEX</text>
                
                <!-- X-Axis Labels -->
                <g font-family="Inter" font-size="7.5" fill="#C7C7C7" text-anchor="middle" letter-spacing="1.5">
                    <text x="60" y="300">Q1 START</text>
                    <text x="163" y="300">Q1 REVIEW</text>
                    <text x="336" y="300">Q2 OPTIMIZE</text>
                    <text x="509" y="300">Q3 SCALE</text>
                    <text x="680" y="300">Q4 AUTOPILOT</text>
                </g>
                
                <!-- Cost Line (Coral) -->
                <path class="chart-line chart-line-delay" d="M 60 50 C 120 70, 160 180, 336 210 C 450 230, 600 260, 680 265" fill="none" stroke="#D45D3A" stroke-width="2.2" stroke-linecap="round" />
                
                <!-- Value/Speed Line (Titanium Grey) -->
                <path class="chart-line chart-line-delay" d="M 60 260 C 150 250, 200 130, 336 100 C 450 70, 600 40, 680 30" fill="none" stroke="#404040" stroke-width="2.2" stroke-linecap="round" />
                
                <!-- Annotations & Hotspots (Cost) -->
                <g class="tooltip-trigger" style="cursor: crosshair;">
                    <circle cx="163" cy="148" r="5" fill="#D45D3A" opacity="0" />
                    <circle cx="163" cy="148" r="3.5" fill="white" stroke="#D45D3A" stroke-width="2" />
                    <text x="175" y="140" font-family="Inter" font-size="7.5" fill="#D45D3A" font-weight="bold" letter-spacing="1">COST OF AI DEPLOYMENT ↓</text>
                    
                    <g class="tooltip-target opacity-0 translate-y-2">
                        <rect x="150" y="90" width="160" height="40" fill="#1A1A1A" rx="4" />
                        <text x="160" y="108" font-family="Inter" font-size="10" fill="white" font-weight="bold">Process Containerization</text>
                        <text x="160" y="122" font-family="Inter" font-size="10" fill="#C7C7C7">Initial cost drops as manual work shifts to AI.</text>
                    </g>
                </g>
                
                <!-- Annotations & Hotspots (Value) -->
                <g class="tooltip-trigger" style="cursor: crosshair;">
                    <circle cx="336" cy="100" r="5" fill="#404040" opacity="0" />
                    <circle cx="336" cy="100" r="3.5" fill="white" stroke="#404040" stroke-width="2" />
                    <text x="320" y="85" font-family="Inter" font-size="7.5" fill="#404040" font-weight="bold" letter-spacing="1" text-anchor="end">↑ VALUE REALIZATION</text>
                    
                    <g class="tooltip-target opacity-0 translate-y-2">
                        <rect x="166" y="45" width="160" height="40" fill="#1A1A1A" rx="4" />
                        <text x="176" y="63" font-family="Inter" font-size="10" fill="white" font-weight="bold">Exponential Scaling</text>
                        <text x="176" y="77" font-family="Inter" font-size="10" fill="#C7C7C7">Output increases linearly without headcount.</text>
                    </g>
                </g>
                
                <g class="tooltip-trigger" style="cursor: crosshair;">
                    <circle cx="680" cy="265" r="5" fill="#D45D3A" opacity="0" />
                    <circle cx="680" cy="265" r="3.5" fill="white" stroke="#D45D3A" stroke-width="2" />
                    <g class="tooltip-target opacity-0 translate-y-2">
                        <rect x="510" y="210" width="160" height="40" fill="#1A1A1A" rx="4" />
                        <text x="520" y="228" font-family="Inter" font-size="10" fill="white" font-weight="bold">Steady State</text>
                        <text x="520" y="242" font-family="Inter" font-size="10" fill="#C7C7C7">Marginal cost of execution approaches zero.</text>
                    </g>
                </g>

            </svg>
        </div>
    </div>
</div>
"""

html = open("execution.html", "r").read()

# Insert before Book a Call in panel-3
target = '<a href="#book" class="bg-accent text-offwhite px-6 py-3 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none whitespace-nowrap inline-block">Book a Call</a>'
if target in html:
    html = html.replace(target, svg_code + "\n                                        " + target)

# Wait, add CSS classes for animations if not present
if "fadeIn" not in html:
    css = """
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    """
    html = html.replace("</style>", css + "\n    </style>")

with open("execution.html", "w") as f:
    f.write(html)
