import re

with open("execution.html", "r") as f:
    content = f.read()

old_nav = """            <nav class="flex flex-wrap justify-center gap-8 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-offwhite/80" aria-label="Main navigation">
                <a href="#" class="hover:text-accent transition-colors">Knowledge</a>
                <a href="#" class="hover:text-accent transition-colors">Advice</a>
                <a href="/execution.html" class="text-accent transition-colors">Execution</a>
                <a href="#" class="hover:text-accent transition-colors">Blog</a>
                <a href="#" class="hover:text-accent transition-colors">About</a>
            </nav>"""

new_nav = """            <!-- NAV: Execution dropdown. Add People Development link. Mark active state for current page. -->
            <nav class="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6 md:gap-8 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-offwhite/80" aria-label="Main navigation">
                <a href="#" class="hover:text-accent transition-colors">Knowledge</a>
                <a href="#" class="hover:text-accent transition-colors">Advice</a>
                
                <div class="relative group flex flex-col md:block items-center w-full md:w-auto z-50">
                    <a href="/execution.html" class="text-accent transition-colors flex items-center gap-1">
                        Execution
                        <svg class="w-3 h-3 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </a>
                    
                    <!-- Desktop Dropdown -->
                    <div class="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden md:group-hover:block z-50">
                        <div class="bg-surface border border-border/50 py-2 min-w-[220px] flex flex-col shadow-xl">
                            <a href="/execution/business-upgrade.html" class="px-4 py-3 hover:text-accent hover:bg-white/5 transition-colors">Business Upgrade</a>
                            <a href="/execution/people-development.html" class="px-4 py-3 hover:text-accent hover:bg-white/5 transition-colors">People Development</a>
                        </div>
                    </div>
                    
                    <!-- Mobile Stacked Links -->
                    <div class="flex flex-col md:hidden items-center mt-3 gap-3 p-4 bg-surface/30 border border-border/50 w-full">
                        <a href="/execution/business-upgrade.html" class="hover:text-accent transition-colors">Business Upgrade</a>
                        <a href="/execution/people-development.html" class="hover:text-accent transition-colors">People Development</a>
                    </div>
                </div>
                
                <a href="#" class="hover:text-accent transition-colors">Blog</a>
                <a href="#" class="hover:text-accent transition-colors">About</a>
            </nav>"""

new_content = content.replace(old_nav, new_nav)
with open("execution.html", "w") as f:
    f.write(new_content)

