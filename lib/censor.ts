import badWords from './badwords.json';

// Create a single RegExp that matches any of the bad words at word boundaries
// Example: \b(bad|curse|heck)\b
const escapedWords = badWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const curseRegex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

export function censorText(text: string): string {
  if (!text) return text;
  
  return text.replace(curseRegex, (match) => {
    return '#'.repeat(match.length);
  });
}
