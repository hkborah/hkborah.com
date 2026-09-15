import re

html = open("execution.html", "r").read()

old_block = """    <section class="py-24 bg-surface/30 border-y border-border/50">
        <div class="container mx-auto px-6 flex flex-col items-start">
            <div class="max-w-3xl mb-16">"""

new_block = """    <section class="py-24 bg-surface/30 border-y border-border/50">
        <div class="container mx-auto px-6 flex flex-col items-center">
            <div class="max-w-3xl mb-16 text-center">"""

html = html.replace(old_block, new_block)

# Also ensure the tabs container takes full width if needed
old_tabs_container = """            <!-- Tabs Container -->
            <div class="max-w-5xl mx-auto">"""
new_tabs_container = """            <!-- Tabs Container -->
            <div class="max-w-5xl w-full mx-auto">"""

html = html.replace(old_tabs_container, new_tabs_container)

with open("execution.html", "w") as f:
    f.write(html)
