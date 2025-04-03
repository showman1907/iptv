let channels = [];

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    channels = parseM3U(text);
    renderChannels();
  };
  reader.readAsText(file);
});

function parseM3U(text) {
  const lines = text.split("\n");
  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",").pop().trim();
      const logo = lines[i].match(/tvg-logo="(.*?)"/)?.[1] || "";
      const group = lines[i].match(/group-title="(.*?)"/)?.[1] || "";
      const url = lines[i + 1] || "";
      parsed.push({ name, logo, group, url });
    }
  }
  return parsed;
}

function generateM3U() {
  let output = "#EXTM3U\n";
  channels.forEach((ch) => {
    output += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
  });
  return output;
}

function renderChannels() {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  channels.forEach((ch, i) => {
    const card = document.createElement("div");
    card.className = "channel-card";

    card.innerHTML = `
      <div class="channel-info">
        <img src="${ch.logo}" alt="logo"/>
        <div class="channel-data">
          <strong>${ch.name}</strong>
          <small>${ch.group}</small>
          <input type="text" value="${ch.url}" onchange="updateUrl(${i}, this.value)" />
        </div>
      </div>
      <div class="actions">
        <button onclick="moveChannel(${i}, -1)" ${i === 0 ? "disabled" : ""}>⬆</button>
        <button onclick="moveChannel(${i}, 1)" ${i === channels.length - 1 ? "disabled" : ""}>⬇</button>
        <button onclick="removeChannel(${i})">Kaldır</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function updateUrl(index, value) {
  channels[index].url = value;
}

function removeChannel(index) {
  channels.splice(index, 1);
  renderChannels();
}

function moveChannel(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= channels.length) return;
  [channels[index], channels[newIndex]] = [channels[newIndex], channels[index]];
  renderChannels();
}

function downloadM3U() {
  const content = generateM3U();
  const fileName = document.getElementById("fileName").value || "playlist.m3u";
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
