import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

class Apps extends React.Component {
	render() {
		return <button onClick={v => console.info('ok')}>Asdf</button>
	}
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
