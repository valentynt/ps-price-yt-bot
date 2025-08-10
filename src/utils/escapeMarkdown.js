export function escapeMarkdown(str = "") {
  return String(str).replace(/[_*\[\]()`>#+\-=|{}.!]/g, "\\\\$&");
}
