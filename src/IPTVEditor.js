// GEREKEN KÜTÜPHANELER:
// npm install react-beautiful-dnd classnames

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";

function parseM3U(content) {
  const lines = content.split(/\r?\n/);
  const channels = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",").pop().trim();
      const logo = lines[i].match(/tvg-logo=\"(.*?)\"/)?.[1] || "";
      const group = lines[i].match(/group-title=\"(.*?)\"/)?.[1] || "";
      const url = lines[i + 1]?.startsWith("http") ? lines[i + 1] : "";
      channels.push({ name, logo, group, url });
      i++;
    }
  }
  return channels;
}

function generateM3U(channels) {
  let output = "#EXTM3U\n";
  channels.forEach((ch) => {
    output += `#EXTINF:-1 tvg-logo=\"${ch.logo}\" group-title=\"${ch.group}\",${ch.name}\n${ch.url}\n`;
  });
  return output;
}

export default function IPTVEditor() {
  const [channels, setChannels] = useState([]);
  const [fileName, setFileName] = useState("playlist.m3u");
  const [newGroup, setNewGroup] = useState("");
  const [groups, setGroups] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseM3U(event.target.result);
      setChannels(parsed);
      const uniqueGroups = [...new Set(parsed.map((ch) => ch.group).filter(Boolean))];
      setGroups(uniqueGroups);
    };
    reader.readAsText(file);
  };

  const downloadM3U = () => {
    const content = generateM3U(channels);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const addGroup = () => {
    if (newGroup && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup]);
      setNewGroup("");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(channels);
    const [removed] = reordered.splice(result.source.index, 1);
    removed.group = result.destination.droppableId;
    reordered.splice(result.destination.index, 0, removed);
    setChannels(reordered);
  };

  const updateChannelField = (index, field, value) => {
    const updated = [...channels];
    updated[index][field] = value;
    setChannels(updated);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">📺 M3U Kanal Düzenleyici</h1>
      <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
        <input type="file" accept=".m3u" onChange={handleFileUpload} />
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Dosya adı"
          className="border rounded px-2 py-1"
        />
        <button onClick={downloadM3U} className="bg-blue-600 text-white px-4 py-1 rounded">
          İndir
        </button>
      </div>
      <div className="flex justify-center gap-2 mb-4">
        <input
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          placeholder="Yeni grup adı"
          className="border px-2 py-1"
        />
        <button
          onClick={addGroup}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          + Grup
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {groups.map((groupName) => (
            <div key={groupName} className="border rounded p-2 bg-white shadow">
              <h2 className="text-xl font-semibold mb-2">{groupName}</h2>
              <Droppable droppableId={groupName}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {channels
                      .filter((ch) => ch.group === groupName)
                      .map((ch, index) => (
                        <Draggable
                          key={`${ch.name}-${index}`}
                          draggableId={`${ch.name}-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <motion.div
                              layout
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded p-2 mb-2 flex flex-col gap-1 shadow-sm bg-gray-50"
                            >
                              <input
                                value={ch.name}
                                onChange={(e) => updateChannelField(index, "name", e.target.value)}
                                className="border px-2 py-1 rounded"
                              />
                              <input
                                value={ch.url}
                                onChange={(e) => updateChannelField(index, "url", e.target.value)}
                                className="border px-2 py-1 rounded text-xs"
                              />
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
