import re

def read_file(path):
    with open(path, 'r') as f: return f.read()

def write_file(path, content):
    with open(path, 'w') as f: f.write(content)

html = read_file('execution.html')

# 1. Unify Alignment -> Make everything Left-Aligned
# Hero
html = html.replace('text-center max-w-4xl', 'max-w-4xl')
html = html.replace('text-center max-w-3xl', 'max-w-3xl')
html = html.replace('text-accent text-center', 'text-accent')
html = html.replace('mx-auto mb-16', 'mb-16')
html = html.replace('text-center flex flex-col items-center', 'flex flex-col items-start')
html = html.replace('text-center md:text-center', 'text-left')
html = html.replace('mx-auto inline-block', 'inline-block')

# Cards
html = html.replace('flex flex-col items-center text-center', 'flex flex-col items-start text-left')
html = html.replace('mb-12 text-center mx-auto', 'mb-12 max-w-3xl')
html = html.replace('mb-6 text-center', 'mb-6 text-left')
html = html.replace('grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center', 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left')

# Center Brain SVG alignment fix (Keep center for the diagram)
html = html.replace('Your Brain Is Full.</h2>', 'Your Brain Is Full.</h2>', 1)
# Keep diagram centered
html = html.replace('<div class="relative w-full max-w-2xl mx-auto aspect-square mb-20 mt-8">', '<div class="relative w-full max-w-2xl mx-auto aspect-square mb-20 mt-8 text-center">')

# 2. Update SVG Diagram to use concentric hexagons & animated moving dots
svg_old = '''                    <!-- Concentric Stress Hexagons -->
                    <g stroke="var(--border)" fill="none" stroke-width="1">
                        <polygon points="400,320 469.3,360 469.3,440 400,480 330.7,440 330.7,360" stroke-dasharray="4 4" class="opacity-30" />
                        <polygon points="400,240 538.6,320 538.6,480 400,560 261.4,480 261.4,320" stroke-dasharray="8 8" class="opacity-50" />
                        <polygon points="400,160 607.8,280 607.8,520 400,640 192.2,520 192.2,280" stroke-width="1.5" class="opacity-80" />
                    </g>
                    <!-- Connection Lines -->
                    <g stroke="var(--border)" stroke-width="1.5" class="opacity-50">
                        <line x1="400" y1="400" x2="400" y2="160" />
                        <line x1="400" y1="400" x2="607.8" y2="280" />
                        <line x1="400" y1="400" x2="607.8" y2="520" />
                        <line x1="400" y1="400" x2="400" y2="640" />
                        <line x1="400" y1="400" x2="192.2" y2="520" />
                        <line x1="400" y1="400" x2="192.2" y2="280" />
                    </g>
                    <!-- Animated Signals -->
                    <g stroke="var(--accent)" stroke-width="3" stroke-linecap="round">
                        <line x1="400" y1="400" x2="400" y2="160" class="signal s-1" />
                        <line x1="400" y1="400" x2="607.8" y2="280" class="signal s-2" />
                        <line x1="400" y1="400" x2="607.8" y2="520" class="signal s-3" />
                        <line x1="400" y1="400" x2="400" y2="640" class="signal s-4" />
                        <line x1="400" y1="400" x2="192.2" y2="520" class="signal s-5" />
                        <line x1="400" y1="400" x2="192.2" y2="280" class="signal s-6" />
                    </g>'''

svg_new = '''                    <!-- Concentric Stress Hexagons -->
                    <g stroke="var(--border)" fill="none" stroke-width="1">
                        <!-- 4 Concentric Hexagons -->
                        <polygon points="400,360 434.6,380 434.6,420 400,440 365.4,420 365.4,380" stroke-dasharray="2 2" class="opacity-20" />
                        <polygon points="400,320 469.3,360 469.3,440 400,480 330.7,440 330.7,360" stroke-dasharray="4 4" class="opacity-30" />
                        <polygon points="400,240 538.6,320 538.6,480 400,560 261.4,480 261.4,320" stroke-dasharray="8 8" class="opacity-50" />
                        <polygon points="400,160 607.8,280 607.8,520 400,640 192.2,520 192.2,280" stroke-width="1.5" class="opacity-80" />
                    </g>
                    <!-- Zigzag Connection Lines (Optional faint guides) -->
                    <defs>
                        <path id="p1" d="M 400 400 L 434.6 380 L 400 320 L 538.6 320 L 400 240 L 400 160" />
                        <path id="p2" d="M 400 400 L 434.6 420 L 469.3 360 L 400 240 L 538.6 320 L 607.8 280" />
                        <path id="p3" d="M 400 400 L 400 440 L 469.3 440 L 469.3 360 L 538.6 480 L 607.8 520" />
                        <path id="p4" d="M 400 400 L 365.4 420 L 400 480 L 261.4 480 L 400 560 L 400 640" />
                        <path id="p5" d="M 400 400 L 365.4 380 L 330.7 440 L 400 560 L 261.4 480 L 192.2 520" />
                        <path id="p6" d="M 400 400 L 400 360 L 330.7 360 L 330.7 440 L 261.4 320 L 192.2 280" />
                    </defs>
                    <g stroke="var(--border)" stroke-width="1" class="opacity-20" fill="none">
                        <use href="#p1"/><use href="#p2"/><use href="#p3"/><use href="#p4"/><use href="#p5"/><use href="#p6"/>
                    </g>
                    
                    <!-- Animated Signals (Moving red dots) -->
                    <g fill="var(--accent)">
                        <circle r="5" opacity="0">
                            <animateMotion dur="4s" repeatCount="indefinite" begin="0s"><mpath href="#p1"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4s" repeatCount="indefinite" begin="0s"/>
                        </circle>
                        <circle r="5" opacity="0">
                            <animateMotion dur="4.2s" repeatCount="indefinite" begin="0.8s"><mpath href="#p2"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4.2s" repeatCount="indefinite" begin="0.8s"/>
                        </circle>
                        <circle r="5" opacity="0">
                            <animateMotion dur="3.8s" repeatCount="indefinite" begin="1.5s"><mpath href="#p3"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.8s" repeatCount="indefinite" begin="1.5s"/>
                        </circle>
                        <circle r="5" opacity="0">
                            <animateMotion dur="4.5s" repeatCount="indefinite" begin="0.3s"><mpath href="#p4"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4.5s" repeatCount="indefinite" begin="0.3s"/>
                        </circle>
                        <circle r="5" opacity="0">
                            <animateMotion dur="4.1s" repeatCount="indefinite" begin="2.1s"><mpath href="#p5"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4.1s" repeatCount="indefinite" begin="2.1s"/>
                        </circle>
                        <circle r="5" opacity="0">
                            <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.2s"><mpath href="#p6"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.5s" repeatCount="indefinite" begin="1.2s"/>
                        </circle>
                        
                        <!-- Second wave of dots -->
                        <circle r="3.5" opacity="0">
                            <animateMotion dur="3.9s" repeatCount="indefinite" begin="2s"><mpath href="#p1"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.9s" repeatCount="indefinite" begin="2s"/>
                        </circle>
                        <circle r="3.5" opacity="0">
                            <animateMotion dur="4.3s" repeatCount="indefinite" begin="2.7s"><mpath href="#p3"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4.3s" repeatCount="indefinite" begin="2.7s"/>
                        </circle>
                        <circle r="3.5" opacity="0">
                            <animateMotion dur="3.6s" repeatCount="indefinite" begin="3.2s"><mpath href="#p5"/></animateMotion>
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.6s" repeatCount="indefinite" begin="3.2s"/>
                        </circle>
                    </g>'''

html = html.replace(svg_old, svg_new)

# 3. Extra Alignment Fixes
# Ensure the bottom section "Execution Services" cards are full-width or properly aligned
html = html.replace('<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-xl">', '<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-xl text-left w-full">')
html = html.replace('<div class="container-main max-w-3xl text-center">', '<div class="container-main max-w-3xl flex flex-col items-start">')
html = html.replace('text-center md:text-right', 'text-left')

# Restore the old css animate-signal if any, but wait, the new SVG doesn't use the old css signal lines
# Remove old CSS for .signal
css_signal_old = '''        .signal {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: flow 3s infinite linear;
        }
        @keyframes flow {
            0% { stroke-dashoffset: 100; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { stroke-dashoffset: -100; opacity: 0; }
        }
        .s-1 { animation-delay: 0s; }
        .s-2 { animation-delay: 0.5s; }
        .s-3 { animation-delay: 1.5s; }
        .s-4 { animation-delay: 1s; }
        .s-5 { animation-delay: 2.5s; }
        .s-6 { animation-delay: 2s; }'''

html = html.replace(css_signal_old, '')

write_file('execution.html', html)
