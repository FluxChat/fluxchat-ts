
function convertMapToJson<K, T>(map: Map<K, T>): string {
  const entries = Array.from(map.entries());
  const jsonObject = Object.fromEntries(entries);
  return JSON.stringify(jsonObject, null, 4);
}

const map = new Map<string, object>();
map.set('a', { a: 1 });
map.set('b', { b: 2 });
map.set('c', { c: 3 });
console.log(convertMapToJson(map));

console.log(JSON.stringify(map, null, 4));
