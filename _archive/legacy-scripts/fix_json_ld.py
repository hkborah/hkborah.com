import re

html = open("advice.html", "r").read()

new_schema = """<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. No signup, no card, no pitch. Ask anything you want. We ask only that you use it honestly. The twin runs on a prepaid budget. When the budget runs out, the door closes for the day. If usage grows beyond what we can sustain, we will let you know before anything changes."
          }
        },
        {
          "@type": "Question",
          "name": "Is my conversation saved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, not by default. Nothing is stored on our servers while you are chatting. Your conversation exists only in your browser. If you press Save, two things happen: you get a PDF copy for your own records, and a copy is stored on hkborah.com for H.K. Borah's personal research only. No personal data is captured with it. No contact details. Nothing for marketing. Nothing shared with anyone other than H.K. Borah himself."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data used for training?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Your conversation is not used to train any public model, and it is not shared with any third party. If you press Save, a copy is stored for H.K. Borah's personal research only."
          }
        },
        {
          "@type": "Question",
          "name": "What if the twin does not know the answer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It will tell you. It will not bluff. If your question is outside its knowledge, it will say so and suggest you book a call."
          }
        },
        {
          "@type": "Question",
          "name": "Is this legal or professional advice?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The twin gives general business advice based on published frameworks. It does not know your specific facts, your legal exposure, or your financial position. It is not a substitute for a formal engagement or a licensed professional. If the answer matters, book a requirements call so we can scope a proper solution."
          }
        },
        {
          "@type": "Question",
          "name": "Where can I read your frameworks in more depth?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I have published three books. The Order of Chaos covers the founder stage. Last Firefighter covers the mid-sized business stage. VEGA covers the enterprise governance stage. All three are at hkborah.com/books."
          }
        }
      ]
    }
    </script>"""

html = re.sub(r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema\.org",\s*"@type": "FAQPage",.*?\}\s*</script>', new_schema, html, flags=re.DOTALL)

with open("advice.html", "w") as f:
    f.write(html)
