export const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => alert("Copied to clipboard!"))
    .catch(() => alert("Failed to copy text."));
};

export const downloadText = (text, filename = "output.txt") => {
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
