import Promise from 'bluebird';

// Ignore this file. Instead, read the MDN documentation on the same-named method.
//
// This file only exists for cross-browser compatibility purposes.

module.exports = function(audioData) {
  var decodeAudioData = Promise.promisify(this.decodeAudioData.bind(this));

  return decodeAudioData(audioData).catch(function(value) {
    return Promise.resolve(value);
  });
}
