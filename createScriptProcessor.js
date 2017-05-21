module.exports = function(Audio) {
  var processor;
  try {
    processor = Audio.createScriptProcessor();
  } catch(error) {
    processor = Audio.createScriptProcessor(4096);
  }

  return processor;
};
