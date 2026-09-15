import re
import glob

for file in glob.glob("*.html"):
    with open(file, 'r') as f:
        html = f.read()
        
    html = html.replace('Talk to My Digital Twin — Free', 'Talk to My Digital Twin')
    html = html.replace('Talk to My Digital Twin - Free', 'Talk to My Digital Twin')
    
    html = re.sub(r'<p[^>]*>\s*Built by operators who have run businesses, not just advised them\.\s*</p>', '', html)
    
    with open(file, 'w') as f:
        f.write(html)
