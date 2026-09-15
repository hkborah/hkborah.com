import re

def read_file(path):
    with open(path, 'r') as f: return f.read()

def write_file(path, content):
    with open(path, 'w') as f: f.write(content)

advice = read_file('advice.html')

# Remove the duplicated header inside the imported chat section to avoid double headings
advice = re.sub(
    r'<div class="text-center mb-10">\s*<h2 class="font-display text-4xl lg:text-5xl font-bold mb-6 text-accent">Advice is free\.</h2>\s*<p class="text-lg lg:text-xl text-offwhite/80 leading-relaxed font-light">.*?</p>\s*</div>',
    '',
    advice,
    flags=re.DOTALL
)

# Define chatwithHK to just focus the chat box
scroll_logic = '''
    <!-- Chat Logic -->
    <script>
        window.chatwithHK = function() {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                chatInput.focus();
            }
        };
'''
advice = advice.replace('<!-- Chat Logic -->\n    <script>', scroll_logic)

write_file('advice.html', advice)
