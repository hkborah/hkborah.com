import os

html_content = """<!-- Business Upgrade sub-page. Branch: redesign/v2. Replace logo path and accent hex before deploy. -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Upgrade | H.K. Borah</title>
    <meta name="description" content="Process and technology practice for mid-sized Indian businesses. Stop running the business. Start leading it.">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    
    <!-- JSON-LD Schemas -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "H.K. Borah",
      "jobTitle": "Business Advisor and Author",
      "url": "https://www.hkborah.com/"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What size business is this for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mid-sized businesses. ₹10 crore to ₹200 crore revenue. Established enough to have a team. Small enough that the owner is still in every room."
          }
        },
        {
          "@type": "Question",
          "name": "How long does an engagement last?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most engagements run three to six months. Some are ongoing monthly retainers. It depends on the bottleneck."
          }
        },
        {
          "@type": "Question",
          "name": "Do you work with my existing team?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We do not replace your team. We build the structure that makes your team perform. We work with the people you already have."
          }
        },
        {
          "@type": "Question",
          "name": "What if the problem is too small for you?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Then we will say so. The digital twin is free. If the answer is simple, you do not need us. We will tell you honestly."
          }
        },
        {
          "@type": "Question",
          "name": "Where do I start?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Book a requirements call. AI takes the intake. I take the call. You get a solution document and a proposal within 72 hours."
          }
        }
      ]
    }
    </script>
    
    <!-- CSS Variables & Base Styles -->
    <style>
        :root {
            --accent: oklch(60.1% .201 21.5);
            --background: oklch(14.5% 0 0);
            --surface: oklch(18.1% 0 0);
            --text-main: oklch(100% 0 0);
            --border: oklch(29% 0 0);
            --muted: oklch(60% 0 0);
        }
        
        .blueprint-grain {
            position: relative;
        }
        .blueprint-grain::before {
            content: "";
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background-color: var(--background);
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
            background-size: 3rem 3rem;
            background-position: center top;
            mask-image: radial-gradient(circle at 50% 0%, black 10%, transparent 80%);
            -webkit-mask-image: radial-gradient(circle at 50% 0%, black 10%, transparent 80%);
        }
        body {
            background-color: var(--background);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6, .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }

        /* Arrows for 2x2 grid */
        .arrow-right::after {
            content: "→";
            position: absolute;
            top: 50%;
            right: -1rem;
            transform: translateY(-50%);
            color: var(--accent);
            font-size: 1.5rem;
        }
        .arrow-down::after {
            content: "↓";
            position: absolute;
            bottom: -1.5rem;
            left: 50%;
            transform: translateX(-50%);
            color: var(--accent);
            font-size: 1.5rem;
        }
        .arrow-left::after {
            content: "←";
            position: absolute;
            top: 50%;
            left: -1rem;
            transform: translateY(-50%);
            color: var(--accent);
            font-size: 1.5rem;
        }
        .arrow-up::after {
            content: "↑";
            position: absolute;
            top: -1.5rem;
            left: 50%;
            transform: translateX(-50%);
            color: var(--accent);
            font-size: 1.5rem;
        }
        @media (max-width: 768px) {
            .arrow-right::after, .arrow-down::after, .arrow-left::after, .arrow-up::after {
                content: "↓";
                position: absolute;
                bottom: -1.5rem;
                left: 50%;
                top: auto;
                right: auto;
                transform: translateX(-50%);
            }
        }
    </style>
    
    <!-- Tailwind Configuration -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        charcoal: 'var(--background)',
                        surface: 'var(--surface)',
                        accent: 'var(--accent)',
                        offwhite: 'var(--text-main)',
                        border: 'var(--border)',
                        muted: 'var(--muted)'
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['"Space Grotesk"', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body class="blueprint-grain antialiased selection:bg-accent selection:text-white flex flex-col min-h-screen">

    <!-- 1. HEADER -->
    <header class="py-6 px-6 lg:px-12 border-b border-border">
        <div class="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-12">
            <a href="/" aria-label="Home" class="flex-shrink-0">
                <img src="https://www.hkborah.com/assets/HKB%20Transparent_1764559024056-f31sBMeT.png" alt="H.K. Borah" class="h-11 w-auto" onerror="this.outerHTML='<span class=\'font-display text-2xl font-bold\'>H.K. Borah</span>'">
            </a>
            
            <!-- NAV: Execution dropdown. Add People Development link. Mark active state for current page. -->
            <nav class="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6 md:gap-8 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-offwhite/80" aria-label="Main navigation">
                <a href="#" class="hover:text-accent transition-colors">Knowledge</a>
                <a href="/advice.html" class="hover:text-accent transition-colors">Advice</a>
                
                <div class="relative group flex flex-col md:block items-center w-full md:w-auto z-50">
                    <a href="/execution.html" class="text-accent transition-colors flex items-center gap-1">
                        Execution
                        <svg class="w-3 h-3 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </a>
                    
                    <!-- Desktop Dropdown -->
                    <div class="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden md:group-hover:block z-50">
                        <div class="bg-surface border border-border/50 py-2 min-w-[220px] flex flex-col shadow-xl">
                            <a href="/execution/business-upgrade.html" class="px-4 py-3 text-accent hover:bg-white/5 transition-colors">Business Upgrade</a>
                            <a href="/execution/people-development.html" class="px-4 py-3 text-offwhite/80 hover:text-accent hover:bg-white/5 transition-colors">People Development</a>
                        </div>
                    </div>
                    
                    <!-- Mobile Stacked Links -->
                    <div class="flex flex-col md:hidden items-center mt-3 gap-3 p-4 bg-surface/30 border border-border/50 w-full">
                        <a href="/execution/business-upgrade.html" class="text-accent transition-colors">Business Upgrade</a>
                        <a href="/execution/people-development.html" class="text-offwhite/80 hover:text-accent transition-colors">People Development</a>
                    </div>
                </div>
                
                <a href="#" class="hover:text-accent transition-colors">Blog</a>
                <a href="#" class="hover:text-accent transition-colors">About</a>
            </nav>
            
            <a href="#book" class="bg-accent text-offwhite px-6 py-3 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none whitespace-nowrap">Book a Call</a>
        </div>
    </header>

    <main class="flex-grow">
        <!-- 2. HERO -->
        <section class="py-24 md:py-32">
            <div class="container mx-auto px-6 max-w-4xl text-center">
                <p class="text-xs font-bold text-muted uppercase tracking-widest mb-6">Execution / Business Upgrade</p>
                <h1 class="font-display font-bold text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6 text-accent">
                    Stop Running the Business.<br>Start Leading It.
                </h1>
                <p class="text-xl md:text-2xl text-offwhite/80 leading-relaxed mb-10 max-w-3xl mx-auto">
                    You built a successful business. Now it runs you. We rebuild the process, inject the right technology, and install the structure so the business runs without you in every room.
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                    <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none w-full sm:w-auto">Book a Requirements Call</a>
                    <!-- WIRES TO EXISTING chatwithHK FUNCTION -->
                    <button onclick="chatwithHK()" class="border border-accent text-accent px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-accent hover:text-offwhite transition-all rounded-none w-full sm:w-auto">Talk to My Digital Twin &mdash; Free</button>
                </div>
                <p class="text-sm text-offwhite/60">Built by operators who have run businesses, not just advised them.</p>
            </div>
        </section>

        <!-- 3. THE BUSINESS LOOP -->
        <section class="py-24 bg-surface/30 border-y border-border/50">
            <div class="container mx-auto px-6 max-w-5xl">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">The Business Loop.</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed">
                        Every business runs on four moves. Most owners are stuck in one of them. We find which one, fix it, and move you forward.
                    </p>
                </div>
                
                <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto p-4 md:p-8">
                    <!-- Central Label -->
                    <div class="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface px-6 py-2 border border-border/50 text-muted uppercase tracking-widest text-xs font-bold z-10 whitespace-nowrap">
                        The Business Loop
                    </div>
                    
                    <!-- Quadrant 1 -->
                    <div class="bg-background border border-border/50 p-8 flex flex-col relative arrow-right">
                        <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">SEE</h3>
                        <p class="text-xs font-bold text-accent uppercase tracking-widest mb-4">What is happening?</p>
                        <p class="text-offwhite/80 leading-relaxed">Market. Process. Numbers. We look at what is really going on inside and outside the business.</p>
                    </div>
                    
                    <!-- Quadrant 2 -->
                    <div class="bg-background border border-border/50 p-8 flex flex-col relative arrow-down">
                        <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">DECIDE</h3>
                        <p class="text-xs font-bold text-accent uppercase tracking-widest mb-4">What is the one move worth making?</p>
                        <p class="text-offwhite/80 leading-relaxed">We cut the noise. We help you pick the path and drop everything else.</p>
                    </div>
                    
                    <!-- Quadrant 4 (bottom-left) -->
                    <div class="bg-background border border-border/50 p-8 flex flex-col relative arrow-up md:order-last">
                        <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">IMPROVE</h3>
                        <p class="text-xs font-bold text-accent uppercase tracking-widest mb-4">What can we learn?</p>
                        <p class="text-offwhite/80 leading-relaxed">We measure what moved, fix what leaked, and repeat the cycle faster.</p>
                    </div>
                    
                    <!-- Quadrant 3 (bottom-right) -->
                    <div class="bg-background border border-border/50 p-8 flex flex-col relative arrow-left">
                        <h3 class="font-display font-bold text-2xl mb-1 text-offwhite">DO</h3>
                        <p class="text-xs font-bold text-accent uppercase tracking-widest mb-4">How do we make it real?</p>
                        <p class="text-offwhite/80 leading-relaxed">We build the structure. Assign the owners. Set the dates. Turn the plan into results.</p>
                    </div>
                </div>
                
                <div class="text-center mt-12">
                    <p class="text-lg text-offwhite font-medium">You are the owner. Your job is SEE and DECIDE. We carry the DO and IMPROVE. That is the deal.</p>
                </div>
            </div>
        </section>

        <!-- 4. WHICH SEAT ARE YOU IN? -->
        <section class="py-24">
            <div class="container mx-auto px-6 max-w-[1100px]">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">Which Seat Are You In?</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed">
                        Every department runs on four moves: See, Decide, Do, Improve. Pick your seat. We will show you where it is stuck.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="seats-container">
                    <!-- Cards will be populated by JS -->
                </div>
            </div>
        </section>

        <!-- 5. DO YOU NEED THIS NOW? -->
        <section class="py-24 bg-surface/30 border-y border-border/50">
            <div class="container mx-auto px-6 max-w-4xl flex flex-col items-center">
                <div class="text-center mb-12">
                    <h2 class="font-display font-bold text-4xl mb-4 tracking-tight text-accent">Be Honest With Yourself.</h2>
                    <p class="text-lg text-offwhite/80 leading-relaxed max-w-3xl mx-auto">
                        It is easy to say next quarter. Here are the signs that waiting is no longer an option. If three or more sound familiar, it is time for a conversation.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-6 mb-12 text-left w-full max-w-3xl">
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">You are the bottleneck for every major decision.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">Your team cannot move forward without your approval.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">You have not taken a real holiday in years.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">Revenue is growing. Profit is not.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">You know the business is inefficient but cannot find time to fix it.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">You are working in the business, not on it.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">You feel exhausted, not excited.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="text-accent font-bold mt-1">&rarr;</span>
                        <p class="text-offwhite/90">Your family has noticed the difference.</p>
                    </div>
                </div>
                
                <div class="flex justify-center">
                    <a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Requirements Call</a>
                </div>
            </div>
        </section>

        <!-- 6. HOW WE WORK -->
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
        </section>

        <!-- 7. FAQ -->
        <section class="py-24 bg-surface/30 border-y border-border/50">
            <div class="container mx-auto px-6 lg:px-12 max-w-[1100px]">
                <h2 class="font-display font-bold text-4xl mb-12 tracking-tight text-accent text-center">Questions.</h2>
                <div class="max-w-3xl mx-auto space-y-8">
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">What size business is this for?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Mid-sized businesses. ₹10 crore to ₹200 crore revenue. Established enough to have a team. Small enough that the owner is still in every room.</p>
                    </div>
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">How long does an engagement last?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Most engagements run three to six months. Some are ongoing monthly retainers. It depends on the bottleneck.</p>
                    </div>
                    
                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Do you work with my existing team?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Yes. We do not replace your team. We build the structure that makes your team perform. We work with the people you already have.</p>
                    </div>

                    <div class="border-b border-border/50 pb-8">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">What if the problem is too small for you?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Then we will say so. The digital twin is free. If the answer is simple, you do not need us. We will tell you honestly.</p>
                    </div>

                    <div class="pb-4">
                        <h3 class="font-display font-bold text-xl mb-3 text-offwhite">Where do I start?</h3>
                        <p class="text-offwhite/80 leading-relaxed">Book a requirements call. AI takes the intake. I take the call. You get a solution document and a proposal within 72 hours.</p>
                    </div>

                </div>
            </div>
        </section>

        <!-- 8. THE CLOSE -->
        <section id="book" class="py-32">
            <div class="container mx-auto px-6 max-w-3xl text-center">
                <h2 class="font-display font-bold text-4xl md:text-5xl mb-6 tracking-tight text-accent">Ready to Move?</h2>
                <p class="text-xl text-offwhite/80 leading-relaxed mb-10">
                    Advice is free. Execution is not. Book a requirements call. AI takes the intake. I take the call. You get a solution document and a proposal within 72 hours.
                </p>
                <div class="flex justify-center"><a href="#book" class="bg-accent text-offwhite px-8 py-4 text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block">Book a Requirements Call</a></div>
            </div>
        </section>
    </main>

    <!-- 9. FOOTER -->
    <footer class="bg-surface py-12 px-6 lg:px-12 border-t border-border/50 text-sm mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <nav class="flex flex-wrap justify-center md:justify-start gap-4 text-offwhite/60" aria-label="Footer navigation">
                <a href="#" class="hover:text-offwhite transition-colors">Knowledge</a>
                <a href="/advice.html" class="hover:text-offwhite transition-colors">Advice</a>
                <a href="/execution.html" class="text-offwhite transition-colors">Execution</a>
                <a href="#" class="hover:text-offwhite transition-colors">Blog</a>
                <a href="#" class="hover:text-offwhite transition-colors">About</a>
                <a href="#" class="hover:text-offwhite transition-colors">Contact</a>
                <a href="#" class="hover:text-offwhite transition-colors">Privacy</a>
                <a href="#" class="hover:text-offwhite transition-colors">Terms</a>
                <a href="#" class="hover:text-offwhite transition-colors">LinkedIn</a>
                <a href="https://thepico.in" target="_blank" rel="noopener noreferrer" class="hover:text-offwhite transition-colors">thepico.in</a>
            </nav>
            <div class="text-offwhite/60 text-center md:text-right">
                <a href="mailto:hemant@hkborah.com" class="block mb-2 text-accent hover:text-offwhite transition-colors">hemant@hkborah.com</a>
                <p>&copy; 2026 H.K. Borah. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Which Seat Are You In Logic -->
    <script>
        const seatsData = [
            {
                title: "Owner",
                pain: "The decision-maker who is also the bottleneck.",
                see: "Market shifts. Your own bandwidth. What the business looks like without you.",
                decide: "Which decision only you can make. Which to hand over.",
                do: "Build the delegation structure. Install the rhythm. Step out of the daily.",
                improve: "What came back to you that should not have. What worked without you."
            },
            {
                title: "Strategy (CBO)",
                pain: "The long-term plan that never leaves your head.",
                see: "Market direction. Competitor moves. Where the industry is going.",
                decide: "Where to play. Where to stop. What to build next.",
                do: "Turn strategy into a one-page plan with owners and timelines.",
                improve: "What the market did versus what you expected. Adjust."
            },
            {
                title: "Operations",
                pain: "The engine room where time and money leak.",
                see: "Where time leaks. Where work stalls. Which manual steps repeat.",
                decide: "Which process to fix first. Which to leave alone.",
                do: "Rebuild the workflow. Inject technology. Set a measurable target.",
                improve: "Cycle time. Error rate. Throughput. What moved."
            },
            {
                title: "Finance",
                pain: "The numbers that hide where cash disappears.",
                see: "Cash position. Margin per product. Cost per unit.",
                decide: "What to cut. What to keep. Where to invest.",
                do: "Build the dashboard. Fix the forecasting. Install the rhythm.",
                improve: "Margin. Cash cycle. Forecast accuracy."
            },
            {
                title: "Marketing",
                pain: "The spend that cannot be measured.",
                see: "Which channels bring customers. Which waste money.",
                decide: "Which message and channel to scale.",
                do: "Fix the funnel. Build the content engine. Set the measurement.",
                improve: "Cost per lead. Conversion rate. Revenue per channel."
            },
            {
                title: "Sales",
                pain: "The pipeline that is not predictable.",
                see: "Pipeline health. Win-loss patterns. Where deals stall.",
                decide: "Which segment, which pitch, which price.",
                do: "Build the sales process. Install the follow-up rhythm.",
                improve: "Close rate. Sales cycle. Forecast accuracy."
            },
            {
                title: "Technology",
                pain: "The tools that slow you down instead of helping.",
                see: "Stack audit. Overlap, gaps, security, cost.",
                decide: "What to cut, keep, integrate, upgrade.",
                do: "Consolidate. Integrate. Secure. Train adoption.",
                improve: "Adoption. Uptime. Cost per seat. Time saved."
            },
            {
                title: "Digital",
                pain: "The online presence that exists but does not convert.",
                see: "Traffic, engagement, drop-off points.",
                decide: "Which digital property to fix first.",
                do: "Rebuild the website, LinkedIn, app alignment.",
                improve: "Traffic to enquiry. Enquiry to revenue."
            },
            {
                title: "HR",
                pain: "The good people who are not delivering.",
                see: "Skill gaps. Culture. Who is carrying, who is coasting.",
                decide: "Which gap to close first. Who to promote, coach, or exit.",
                do: "Build the training, the rhythm, the review.",
                improve: "Retention. Productivity. Engagement."
            }
        ];

        const container = document.getElementById('seats-container');
        
        seatsData.forEach((seat, index) => {
            const card = document.createElement('div');
            card.className = "bg-surface border border-border/50 p-6 flex flex-col relative transition-all duration-300";
            card.innerHTML = `
                <div class="cursor-pointer group focus:outline-none" aria-expanded="false" role="button" tabindex="0" onclick="toggleCard(${index})">
                    <h3 class="font-display font-bold text-2xl text-offwhite mb-2">${seat.title}</h3>
                    <p class="text-sm text-offwhite/80 leading-relaxed mb-4">${seat.pain}</p>
                    <div class="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mt-2">
                        <span class="loop-toggle-text group-hover:text-offwhite transition-colors">Show the Loop</span>
                        <svg class="w-4 h-4 transition-transform duration-200 chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                
                <div class="hidden expandable-content mt-6 pt-6 border-t border-border/50" id="content-${index}">
                    <div class="space-y-4 mb-8">
                        <div>
                            <span class="text-xs font-bold text-accent uppercase tracking-widest block mb-1">SEE</span>
                            <p class="text-sm text-offwhite/80">${seat.see}</p>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-accent uppercase tracking-widest block mb-1">DECIDE</span>
                            <p class="text-sm text-offwhite/80">${seat.decide}</p>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-accent uppercase tracking-widest block mb-1">DO</span>
                            <p class="text-sm text-offwhite/80">${seat.do}</p>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-accent uppercase tracking-widest block mb-1">IMPROVE</span>
                            <p class="text-sm text-offwhite/80">${seat.improve}</p>
                        </div>
                    </div>
                    <a href="#book" class="bg-accent text-offwhite px-4 py-3 text-xs font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-none inline-block text-center w-full">Book a Requirements Call</a>
                </div>
            `;
            
            // Allow keyboard activation
            card.querySelector('[role="button"]').addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCard(index);
                }
            });
            
            container.appendChild(card);
        });

        function toggleCard(index) {
            const allCards = container.children;
            
            for (let i = 0; i < allCards.length; i++) {
                const content = allCards[i].querySelector('.expandable-content');
                const button = allCards[i].querySelector('[role="button"]');
                const chevron = allCards[i].querySelector('.chevron');
                const text = allCards[i].querySelector('.loop-toggle-text');
                
                if (i === index) {
                    const isHidden = content.classList.contains('hidden');
                    if (isHidden) {
                        content.classList.remove('hidden');
                        button.setAttribute('aria-expanded', 'true');
                        chevron.classList.add('rotate-180');
                        text.innerText = "Hide the Loop";
                    } else {
                        content.classList.add('hidden');
                        button.setAttribute('aria-expanded', 'false');
                        chevron.classList.remove('rotate-180');
                        text.innerText = "Show the Loop";
                    }
                } else {
                    // Auto close others
                    content.classList.add('hidden');
                    button.setAttribute('aria-expanded', 'false');
                    chevron.classList.remove('rotate-180');
                    text.innerText = "Show the Loop";
                }
            }
        }
    </script>
</body>
</html>
"""

with open("execution/business-upgrade.html", "w") as f:
    f.write(html_content)
