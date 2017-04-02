import React from 'react';
import { partialRight } from 'lodash';

function onChange(event) {
  var fileReader = new FileReader;
  var file = event.target.files[0];

  fileReader.onload = handleLoaded.bind(this, fileReader);

  fileReader.readAsArrayBuffer(file);
}

function handleLoaded(fileReader) {
  var Audio = new window.AudioContext

  Audio.decodeAudioData(fileReader.result)
    .then(partialRight(processDecodedAudio.bind(this), Audio));
}

function processDecodedAudio(audioData, Audio) {
  var analyser = Audio.createAnalyser();
  var processor = Audio.createScriptProcessor();
  processor.buffer = audioData;
  analyser.connect(processor);
  processor.connect(Audio.destination);

  var source = _.assign(Audio.createBufferSource(), {
    buffer: audioData,
    loop: true
  });

  source.connect(analyser);
  source.connect(Audio.destination);

  processor.onaudioprocess = drawUpdate.bind(null, this.refs.canvas, analyser);

  source.start();
}


function drawUpdate(canvas, analyser) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var canvasCtx = canvas.getContext('2d');
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  var dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  canvasCtx.beginPath();

  var sliceWidth = canvas.width * 1.0 / analyser.frequencyBinCount;
  var x = 0;

  for(var i = 0; i < analyser.frequencyBinCount; i++) {
    var v = dataArray[i] / 128.0;
    var y = v * canvas.height/2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height/2);
  canvasCtx.stroke();
}


function wireGraph(nodes) {
}

export default class Analyser extends React.Component {
  render () {
    return (
      <div>
        <input
          type="file"
          onChange={onChange.bind(this)}
          style={{
            display: 'block'
          }}
        />
        <canvas ref="canvas" />
        {this.props.children}
      </div>
    );
  }
}
