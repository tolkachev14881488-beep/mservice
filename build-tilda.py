import re, pathlib
p = pathlib.Path(__file__).parent
css = (p / "styles.css").read_text(encoding="utf-8")
js = (p / "main.js").read_text(encoding="utf-8")
html = (p / "index.html").read_text(encoding="utf-8")
body = re.search(r'(<div id="ms-root">.*?</div>)\s*<script', html, re.S).group(1)
fonts = (
    '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@600;700;800;900&display=swap" rel="stylesheet" />'
)
fix = "\n#ms-root{width:100%!important;max-width:100%!important}\n"
(p / "tilda.html").write_text(
    f"<!-- MService v3 Tilda -->\n{fonts}\n<style>\n{css}{fix}\n</style>\n\n{body}\n<script>\n{js}\n</script>\n",
    encoding="utf-8",
)
print("OK")
