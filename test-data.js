import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

const GAS_URL = env.VITE_GAS_URL;
const TOKEN = env.VITE_GAS_TOKEN;

async function test() {
  const url = new URL(GAS_URL);
  url.searchParams.append('token', TOKEN);
  url.searchParams.append('action', 'getLeads');
  
  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    
    const sanitize = (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && !(val instanceof Date)) {
        try { return JSON.stringify(val); } catch(e) { return String(val); }
      }
      return val;
    };
    
    if (Array.isArray(data)) {
      data.forEach((row, i) => {
        Object.keys(row).forEach(k => {
          const s = sanitize(row[k]);
          if (typeof s === 'object') {
            console.log(`Row ${i} Key ${k} is still an object!`, s);
          }
        });
      });
      console.log("Checked all array elements.");
    } else {
      console.log("Data is not an array:", data);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
