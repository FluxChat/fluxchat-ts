import { format as f } from 'util';

(() => {
  const usedAt = new Date();
  console.log(usedAt);
  console.log(usedAt.getTime());
  console.log(f('usedAt: %s', usedAt));
  console.log(f('usedAt: %s', usedAt.toISOString()));

  const diff = (new Date()).getTime() - usedAt.getTime();
  console.log(diff);
})();
