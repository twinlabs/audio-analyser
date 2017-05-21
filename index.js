import React from 'react';
import ReactDOM from 'react-dom';
import Analyser from './Analyser.jsx';

ReactDOM.render(
  <div>
    <Analyser
      detuneRange={2000}
    />
  </div>
  ,
  document.getElementById('root')
)
