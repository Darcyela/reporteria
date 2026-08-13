const fs = require('fs');
const path = String.raw`C:\Users\ceorregoa\.claude\projects\C--Users-ceorregoa-OneDrive---Asociaci-n-Chilena-de-Seguridad-Documents-GitHub-reporteria-vigilancia\f257914a-e64f-4bc9-a02a-fc296418cb65.jsonl`;
const lines = fs.readFileSync(path, 'utf-8').split('\n');
let count = 0;
for (const line of lines) {
  if (!line.trim()) continue;
  let obj;
  try { obj = JSON.parse(line); } catch (e) { continue; }
  if (obj.type === 'user') {
    const content = obj.message && obj.message.content;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c.type === 'text') {
          console.log('---TEXT---');
          console.log(c.text.slice(0, 4000));
          count++;
          if (count >= 3) process.exit(0);
        }
      }
    } else if (typeof content === 'string') {
      console.log('---TEXT(str)---');
      console.log(content.slice(0, 4000));
      count++;
      if (count >= 3) process.exit(0);
    }
  }
}
