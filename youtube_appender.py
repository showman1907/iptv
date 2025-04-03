# youtube_appender.py

# Eklemek istediğiniz YouTube videoları burada
youtube_videos = [
    {
        "id": "aQuDq8w2MXQ",
        "name": "Özel YouTube Kanalı"
    }
]

iptv_file = "gkhn190744.m3u"

# Mevcut dosyayı oku
with open(iptv_file, "r", encoding="utf-8") as file:
    lines = file.readlines()

# Daha önce eklenmiş YOUTUBE kısmı varsa sil
cleaned_lines = []
youtube_found = False
for line in lines:
    if line.strip() == "# === YOUTUBE ===":
        youtube_found = True
        continue
    if youtube_found and line.startswith("#EXTINF"):
        continue
    if youtube_found and line.startswith("https://www.youtube.com"):
        continue
    cleaned_lines.append(line)

# Yeni YouTube bölümü oluştur
youtube_section = ["\n# === YOUTUBE ===\n"]
for video in youtube_videos:
    youtube_section.append(
        f'#EXTINF:-1 tvg-id="youtube" tvg-name="{video["name"]}" tvg-logo="https://img.youtube.com/vi/{video["id"]}/hqdefault.jpg" group-title="YouTube",{video["name"]}\n'
    )
    youtube_section.append(f'https://www.youtube.com/watch?v={video["id"]}\n')

# Dosyayı güncelle
with open(iptv_file, "w", encoding="utf-8") as file:
    file.writelines(cleaned_lines)
    file.writelines(youtube_section)
