const { tm } = require('tunnelmole');

(async () => {
  const url = await tm(3000);
  console.log('لینک عمومی شما: ' + url);
})();