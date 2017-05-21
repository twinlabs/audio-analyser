import React from 'react';
import decodeAudioData from './decodeAudioData';
import createScriptProcessor from './createScriptProcessor';

function handleLoaded(fileReader) {
  var Audio = new (window.AudioContext || window.webkitAudioContext);

  var processor = createScriptProcessor(Audio);
  var analyser = Audio.createAnalyser();

  decodeAudioData.bind(Audio)(fileReader.result)
    .then(processDecodedAudio(Audio, processor, analyser))
    .then(start.bind(this))
    .then(function(audioSource) {
      this.setState({
        audioSource
      });
    }.bind(this));
}

function processDecodedAudio(Audio, processor, analyser) {

  return function(audioData) {
    processor.buffer = audioData;

    var audioSource = Object.assign(Audio.createBufferSource(), {
      buffer: audioData,
      loop: true
    });

    return Promise.resolve({audioSource, processor, analyser});
  };

}

function start({audioSource, processor, analyser}) {
  wireGraph(audioSource, processor, analyser);

  processor.onaudioprocess = drawUpdate.bind(null, this.refs.canvas, analyser);

  audioSource.start();

  return Promise.resolve(audioSource);
}

function wireGraph(audioSource, processor, analyser) {
  audioSource.connect(analyser);
  audioSource.connect(audioSource.context.destination);

  processor.connect(audioSource.context.destination);
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

export default class Analyser extends React.Component {
  onTuneChange(event) {
    if (!this.state.audioSource) {
      return false;
    }

    this.state.audioSource.detune.value = event.target.value
  }

  onFileChange(event) {
    var fileReader = new FileReader;
    var file = event.target.files[0];

    fileReader.onload = handleLoaded.bind(this, fileReader);

    fileReader.readAsArrayBuffer(file);
  }

  render () {
    return (
      <div>
        <input
          type="file"
          onChange={this.onFileChange.bind(this)}
          style={{
            display: 'block'
          }}
        />
        <input
          type="range"
          min={-this.props.detuneRange}
          max={this.props.detuneRange}
          onChange={this.onTuneChange.bind(this)}
        />
        <canvas ref="canvas" />
        {this.props.children}
      </div>
    );
  }
}
