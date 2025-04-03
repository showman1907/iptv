
let channels = [];
let fileName = "playlist.m3u";

document.getElementById('fileInput').addEventListener('change', handleFileUpload);
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById("fileName").innerText = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target.result;
        channels = parseM3U(text);
        renderChannels();
    };
    reader.readAsText(file);
}

function parseM3U(text) {
    const lines = text.split('\n');
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
            const name = lines[i].split(',').pop().trim();
            const logo = lines[i].match(/tvg-logo="(.*?)"/)?.[1] || "";
            const group = lines[i].match(/group-title="(.*?)"/)?.[1] || "";
            const url = lines[i + 1]?.startsWith("http") ? lines[i + 1] : "";
            result.push({ name, logo, group, url });
        }
    }
    return result;
}

function renderChannels() {
    const list = document.getElementById("channelList");
    list.innerHTML = "";
    channels.forEach((ch, i) => {
        const item = document.createElement("div");
        item.className = "channel";
        item.innerHTML = `
            <div>
                <strong>${ch.name}</strong> <em>${ch.group}</em>
                <br />
                <input type="text" value="${ch.url}" onchange="updateUrl(${i}, this.value)" />
            </div>
            <div>
                <button onclick="moveUp(${i})">🔼</button>
                <button onclick="moveDown(${i})">🔽</button>
                <button onclick="removeChannel(${i})">Kaldır</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function updateUrl(index, newUrl) {
    channels[index].url = newUrl;
}

function removeChannel(index) {
    channels.splice(index, 1);
    renderChannels();
}

function moveUp(index) {
    if (index === 0) return;
    [channels[index - 1], channels[index]] = [channels[index], channels[index - 1]];
    renderChannels();
}

function moveDown(index) {
    if (index === channels.length - 1) return;
    [channels[index + 1], channels[index]] = [channels[index], channels[index + 1]];
    renderChannels();
}

function generateM3U() {
    let output = "#EXTM3U\n";
    channels.forEach(ch => {
        output += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
    });
    return output;
}

function downloadM3U() {
    const content = generateM3U();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const outName = document.getElementById("outputName").value.trim() || fileName;
    a.href = url;
    a.download = outName;
    a.click();
}
