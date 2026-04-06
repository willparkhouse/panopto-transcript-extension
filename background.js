chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: extractAndDownload,
    });
  } catch (e) {
    console.error("Panopto transcript extension error:", e);
  }
});

function extractAndDownload() {
  const pane = document.getElementById("transcriptTabPane");
  if (!pane) return;
  const items = pane.querySelectorAll("li.index-event");
  if (!items.length) {
    alert("No transcript entries found. Open the Transcript tab first.");
    return;
  }
  const lines = [];
  items.forEach((li) => {
    const time = li.querySelector(".event-time")?.textContent.trim() ?? "";
    const text = Array.from(li.querySelectorAll(".event-text span"))
      .map((s) => s.textContent.trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) lines.push(`[${time}] ${text}`);
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const title = (document.title || "panopto-transcript").replace(/[\\/:*?"<>|]+/g, "_");
  a.href = url;
  a.download = `${title}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
