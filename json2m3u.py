# json2m3u.py
import json

json_file = "m3u-editor/channels.json"
m3u_file = "gkhn190744.m3u"

with open(json_file, "r", encoding="utf-8") as f:
    channels = json.load(f)

with open(m3u_file, "w", encoding="utf-8") as f:
    f.write("#EXTM3U\n")
    for ch in channels:
        f.write(f"#EXTINF:-1,{ch['name']}\n")
        f.write(f"{ch['url']}\n")

print(f"{len(channels)} kanal başarıyla .m3u dosyasına aktarıldı.")
