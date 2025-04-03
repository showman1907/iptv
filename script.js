let channels = [];

document.getElementById('fileInput').addEventListener('change', handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    parseM3U(content);
  };
  reader.readAsText(file);
}

function parseM3U(text) {
  channels = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(',').pop().trim();
      const group = (lines[i].match(/group-title="(.*?)"/) || [])[1] || "";
      const logo = (lines[i].match(/tvg-logo="(.*?)"/) || [])[1] || "";
      const url = lines[i + 1];
      channels.push({ name, group, logo, url });
    }
  }
  renderList();
}

function renderList() {
  const ul = document.getElementById('channelList');
  ul.innerHTML = '';
  channels.forEach((ch, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${ch.name}</strong> <em>${ch.group}</em>
        ${ch.logo ? `<img src="${ch.logo}" alt="logo" width="30" />` : ''}
      </div>
      <button onclick="removeChannel(${index})">Kaldır</button>
    `;
    ul.appendChild(li);
  });
}

function removeChannel(index) {
  channels.splice(index, 1);
  renderList();
}

function generateM3U() {
  let output = '#EXTM3U\n';
  channels.forEach(ch => {
    output += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
  });
  return output;
}

function downloadM3U() {
  const fileName = document.getElementById('fileName').value || 'playlist';
  const content = generateM3U();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName + '.m3u';
  a.click();
}
