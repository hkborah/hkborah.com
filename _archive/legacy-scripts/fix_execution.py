import re

def read_file(path):
    with open(path, 'r') as f: return f.read()

def write_file(path, content):
    with open(path, 'w') as f: f.write(content)

html = read_file('execution.html')

# 1. Restore the SVG section with straight red dots & moving hexagon
svg_start_str = '<!-- SVG Canvas -->'
svg_end_str = '<!-- Brain Center -->'
svg_regex = re.compile(rf'{svg_start_str}.*?{svg_end_str}', re.DOTALL)

new_svg = '''<!-- SVG Canvas -->
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
                    <!-- Concentric Stress Hexagons (Static Base) -->
                    <g stroke="var(--border)" fill="none" stroke-width="1">
                        <polygon points="400,320 469.3,360 469.3,440 400,480 330.7,440 330.7,360" stroke-dasharray="4 4" class="opacity-30" />
                        <polygon points="400,240 538.6,320 538.6,480 400,560 261.4,480 261.4,320" stroke-dasharray="8 8" class="opacity-50" />
                        <polygon points="400,160 607.8,280 607.8,520 400,640 192.2,520 192.2,280" stroke-width="1.5" class="opacity-80" />
                    </g>

                    <!-- Moving Hexagons from Center -->
                    <polygon points="400,160 607.8,280 607.8,520 400,640 192.2,520 192.2,280" fill="none" stroke="var(--accent)" stroke-width="1.5" style="transform-origin: 400px 400px;">
                        <animateTransform attributeName="transform" type="scale" values="0;1.2" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="4s" repeatCount="indefinite" />
                    </polygon>
                    <polygon points="400,160 607.8,280 607.8,520 400,640 192.2,520 192.2,280" fill="none" stroke="var(--accent)" stroke-width="1.5" style="transform-origin: 400px 400px;">
                        <animateTransform attributeName="transform" type="scale" values="0;1.2" dur="4s" begin="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="4s" begin="2s" repeatCount="indefinite" />
                    </polygon>

                    <!-- Random Traveling Red Dots -->
                    <g fill="var(--accent)">
                        <!-- Path 1 (Top) -->
                        <circle cx="400" cy="400" r="4">
                            <animate attributeName="cy" values="400;160" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="3">
                            <animate attributeName="cy" values="400;160" dur="3s" begin="2.1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3s" begin="2.1s" repeatCount="indefinite" />
                        </circle>

                        <!-- Path 2 (Top Right) -->
                        <circle cx="400" cy="400" r="4.5">
                            <animate attributeName="cx" values="400;607.8" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;280" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="3.5">
                            <animate attributeName="cx" values="400;607.8" dur="2.4s" begin="3.2s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;280" dur="2.4s" begin="3.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="3.2s" repeatCount="indefinite" />
                        </circle>

                        <!-- Path 3 (Bottom Right) -->
                        <circle cx="400" cy="400" r="4">
                            <animate attributeName="cx" values="400;607.8" dur="3.2s" begin="0.7s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;520" dur="3.2s" begin="0.7s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3.2s" begin="0.7s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="3">
                            <animate attributeName="cx" values="400;607.8" dur="2.7s" begin="2.8s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;520" dur="2.7s" begin="2.8s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.7s" begin="2.8s" repeatCount="indefinite" />
                        </circle>

                        <!-- Path 4 (Bottom) -->
                        <circle cx="400" cy="400" r="4.5">
                            <animate attributeName="cy" values="400;640" dur="2.9s" begin="0.1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.9s" begin="0.1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="4">
                            <animate attributeName="cy" values="400;640" dur="3.5s" begin="1.9s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3.5s" begin="1.9s" repeatCount="indefinite" />
                        </circle>

                        <!-- Path 5 (Bottom Left) -->
                        <circle cx="400" cy="400" r="4">
                            <animate attributeName="cx" values="400;192.2" dur="2.6s" begin="1.4s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;520" dur="2.6s" begin="1.4s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.6s" begin="1.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="3.5">
                            <animate attributeName="cx" values="400;192.2" dur="3.1s" begin="3.6s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;520" dur="3.1s" begin="3.6s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3.1s" begin="3.6s" repeatCount="indefinite" />
                        </circle>

                        <!-- Path 6 (Top Left) -->
                        <circle cx="400" cy="400" r="5">
                            <animate attributeName="cx" values="400;192.2" dur="3.4s" begin="0.9s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;280" dur="3.4s" begin="0.9s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3.4s" begin="0.9s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="400" cy="400" r="3">
                            <animate attributeName="cx" values="400;192.2" dur="2.5s" begin="2.5s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="400;280" dur="2.5s" begin="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="2.5s" begin="2.5s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
                <!-- Brain Center -->'''

html = svg_regex.sub(new_svg, html)

# 2. Restore alignments to center
# Replace back all the things that broke layout
html = html.replace('<div class="container-main max-w-4xl">', '<div class="container-main text-center max-w-4xl">')
html = html.replace('<div class="container-main flex flex-col items-start">', '<div class="container-main text-center flex flex-col items-center">')
html = html.replace('<div class="max-w-3xl mb-16">', '<div class="text-center max-w-3xl mx-auto mb-16">')
html = html.replace('<h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">', '<h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent text-center">')
html = html.replace('<div class="container-main max-w-4xl flex flex-col items-center">', '<div class="container-main text-center max-w-4xl flex flex-col items-center">')
html = html.replace('<div class="container-main max-w-3xl flex flex-col items-start">', '<div class="container-main max-w-3xl text-center">')

html = html.replace('tab-btn w-full text-left', 'tab-btn w-full text-center md:text-center')
html = html.replace('flex flex-col items-start text-left', 'flex flex-col items-center text-center')
html = html.replace('mb-12 max-w-3xl', 'mb-12 text-center mx-auto')
html = html.replace('mb-6 text-left', 'mb-6 text-center')
html = html.replace('grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left', 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center')
html = html.replace('<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-xl text-left w-full">', '<div class="bg-surface/30 p-8 md:p-10 border border-border/50 rounded-xl flex flex-col items-center text-center">')
html = html.replace('text-center text-center', 'text-center') # deduplicate
html = html.replace('mx-auto inline-block', 'mx-auto inline-block')

write_file('execution.html', html)
