# youtube_appender.py
import subprocess

# Eklemek istediğiniz YouTube canlı yayın videoları burada
youtube_videos = [
    {
        "id": "ztmY_cCtUl0",
        "name": "Sözcü TV (YouTube Canlı)"
    }
]

iptv_file = "gkhn190744.m3u"

# YouTube linkinden m3u8 linkini çekme fonksiyonu
def get_stream_url(video_id):
    try:
        result = subprocess.run(
            ["yt-dlp", "-g", f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True,
            text=True,
            check=True
        )
        url = result.stdout.strip().splitlines()[0]
        print(f"[✓] {video_id} için stream bulundu: {url}")
        return url
    except subprocess.CalledProcessError as e:
        print(f"[!] {video_id} için yt-dlp çalışmadı!")
        print("stderr:", e.stderr)
        print("stdout:", e.stdout)
        return None

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
    if youtube_found and ("youtube.com" in line or "googlevideo.com" in line):
        continue
    cleaned_lines.append(line)

# Yeni YouTube bölümü oluştur
youtube_section = ["\n# === YOUTUBE ===\n"]
for video in youtube_videos:
    stream_url = get_stream_url(video["id"])
    if stream_url:
        youtube_section.append(
            f'#EXTINF:-1 tvg-id="youtube" tvg-name="{video["name"]}" tvg-logo="https://img.youtube.com/vi/{video["id"]}/hqdefault.jpg" group-title="YouTube",{video["name"]}\n'
        )
        youtube_section.append(f'{stream_url}\n')

# Dosyayı güncelle
with open(iptv_file, "w", encoding="utf-8") as file:
    file.writelines(cleaned_lines)
    file.writelines(youtube_section)
