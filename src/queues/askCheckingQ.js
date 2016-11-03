const async = require('async');
const rp = require('request-promise');
const askCreationQ = require('./askCreationQ');
const config = require('./../../config');
const parseJSON = require('./../requestHelpers').parseJSON;

const askCheckingQ = async.queue((id, callback) => {
  rp(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    .then(parseJSON)
    .then((ask) => {
      const aproxQLength = askCheckingQ.length() + config.asyncWorkers.askCheckingQ;
      console.log(`Checked Ask ${id} (<${aproxQLength} left)`);

      if ({}.hasOwnProperty.call(ask, 'dead')) {
        return callback();
      }

      return askCreationQ.push(ask, () => {});
    })
    .catch((err) => {
      callback(err);
    });
}, config.asyncWorkers.askCheckingQ);

askCheckingQ.drain = () => {
  console.log('Checked all Asks.');
};

module.exports = askCheckingQ;
