import re

def read_file(path):
    with open(path, 'r') as f: return f.read()

def write_file(path, content):
    with open(path, 'w') as f: f.write(content)

advice = read_file('advice.html')
index = read_file('index.html')

# 1. Extract Chat Section from index.html
chat_match = re.search(r'<!-- 4\. DIGITAL TWIN SECTION -->(.*?)<!-- 5\. BOOKS SECTION -->', index, re.DOTALL)
if chat_match:
    chat_html = "<!-- 3. CHAT ENTRY PANEL (Imported from index) -->\n" + chat_match.group(1)
    
    # modify chat_html to stretch width
    chat_html = chat_html.replace('max-w-4xl', 'max-w-6xl')
    chat_html = chat_html.replace('h-[600px]', 'h-[75vh]')
    chat_html = chat_html.replace('rounded-lg', 'rounded-none')
    
    # 2. Add the custom disclaimer to the chat_html
    disclaimer = "Disclaimer: This digital twin is trained on HK Borah's published frameworks and books. It provides general advice, not professional prescription. It is not a substitute for a formal engagement, a licensed professional, or a legally binding proposal. Nothing you type is stored on my server unless you press Save. If you press Save, you get a copy for your records, and a copy is stored for my personal use only. No personal data is captured, and nothing is shared with anyone else."
    
    chat_html += f'''
    <p class="text-xs text-offwhite/50 leading-relaxed max-w-4xl mx-auto mt-6 text-center font-light">
        {disclaimer}
    </p>
    '''
    
    # 3. Replace the chat section in advice.html
    advice = re.sub(
        r'<!-- 3\. CHAT ENTRY PANEL -->.*?<!-- 4\. WHAT IS THE DIGITAL TWIN\? -->',
        chat_html + '\n<!-- 4. WHAT IS THE DIGITAL TWIN? -->',
        advice,
        flags=re.DOTALL
    )

# 4. Modify What is this?
what_is_this_replacement = '''
        <!-- 4. WHAT IS THE DIGITAL TWIN? -->
        <section class="py-24 px-6 lg:px-12 border-b border-border/50">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="font-display font-bold text-4xl tracking-tight text-accent mb-8">What Is This?</h2>
                <div class="space-y-6 text-lg text-offwhite/80 leading-relaxed text-center">
'''
advice = re.sub(
    r'<!-- 4\. WHAT IS THE DIGITAL TWIN\? -->\s*<section class="py-24 px-6 lg:px-12 border-b border-border/50">\s*<div class="max-w-\[1100px\] mx-auto flex flex-col md:flex-row gap-12 items-start">\s*<div class="md:w-1/3">\s*<h2 class="font-display font-bold text-4xl tracking-tight text-accent">What Is This\?</h2>\s*</div>\s*<div class="md:w-2/3 space-y-6 text-lg text-offwhite/80 leading-relaxed">',
    what_is_this_replacement,
    advice,
    flags=re.DOTALL
)

# 5. Modify How Access Works
how_access_replacement = '''
        <!-- 8. HOW ACCESS WORKS -->
        <section class="py-24 px-6 lg:px-12 border-b border-border/50">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="font-display font-bold text-4xl tracking-tight text-accent mb-8">How Access Works.</h2>
                <div class="space-y-6 text-lg text-offwhite/80 leading-relaxed text-center">
'''
advice = re.sub(
    r'<!-- 8\. HOW ACCESS WORKS -->\s*<section class="py-24 px-6 lg:px-12 border-b border-border/50">\s*<div class="max-w-\[1100px\] mx-auto flex flex-col md:flex-row gap-12 items-start">\s*<div class="md:w-1/3">\s*<h2 class="font-display font-bold text-4xl tracking-tight text-accent">How Access Works\.</h2>\s*</div>\s*<div class="md:w-2/3 space-y-6 text-lg text-offwhite/80 leading-relaxed">',
    how_access_replacement,
    advice,
    flags=re.DOTALL
)

# 6. Remove the save-modal HTML block completely
advice = re.sub(
    r'<!-- SAVE AS PDF IDENTITY MODAL -->.*?<!-- SCRIPT SECTION -->',
    '<!-- SCRIPT SECTION -->',
    advice,
    flags=re.DOTALL
)

write_file('advice.html', advice)
