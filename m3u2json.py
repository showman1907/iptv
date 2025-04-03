import json

m3u_file = "gkhn190744.m3u"
json_file = "m3u-editor/channels.json"

channels = []

with open(m3u_file, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i in range(len(lines)):
        if lines[i].startswith("#EXTINF"):
            name = lines[i].split(",")[-1].strip()
            url = lines[i+1].strip() if i + 1 < len(lines) else ""
            channels.append({"name": name, "url": url})

with open(json_file, "w", encoding="utf-8") as f:
    json.dump(channels, f, ensure_ascii=False, indent=2)

print(f"{len(channels)} kanal başarıyla channels.json dosyasına aktarıldı.")
