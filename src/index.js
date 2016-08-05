import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

class Temperature extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      celsius: true
    };
    this.switchUnit = this.switchUnit.bind(this);
  };

  getTemperature(kelvin) {
    if (this.state.celsius) {
      return Number((kelvin - 273.15).toFixed(1)) + " °C";
    } else {
      return Number((kelvin * 9/5 - 459.67).toFixed(1)) + " °F";
    }
  };

  switchUnit() {
    const newState = !this.state.celsius;
    this.setState({celsius: newState});
  };

  render() {

    return (
      <div>
        <h1>{this.getTemperature(this.props.kelvin)}</h1>
        <button onClick={this.switchUnit}>°C / Fahrenheit</button>
      </div>
    )
  };
}

class Weather extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      temp: undefined,
      main: '',
      description: '',
      icon: '',
      country: '',
      city: ''
    };
  };

  getWeather() {
    const request = new XMLHttpRequest();
    const url = [
      'http://api.openweathermap.org/data/2.5/weather?lat=',
      this.props.lat,
      '&lon=',
      this.props.lon,
      '&appid=58198c11fcda885e9caae8a689461910'
    ].join('');

    request.open('GET', url, true);

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        const weather = JSON.parse(request.responseText);
        this.setState({
          temp: weather.main.temp,
          main: weather.weather["0"].main,
          description: weather.weather["0"].description,
          icon: ['http://openweathermap.org/img/w/', weather.weather["0"].icon, '.png'].join(''),
          country: weather.sys.country,
          city: weather.name,
        });
      } else {
        // We reached our target server, but it returned an error

      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
  };


  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps, {lat: this.props.lat, lon: this.props.lon})) {
      this.getWeather()
    };
  };

  componentDidMount() {
    this.getWeather();
  };

  render() {
    if (this.state.temp) {
      return (
        <div>
          <p>{this.state.city}, {this.state.country}</p>
          <p>{this.state.main} ({this.state.description})</p>
          <p><img src={this.state.icon} alt="Weather icon" /></p>
          <Temperature kelvin={this.state.temp} />
        </div>
      )
    } else {
      return (
        <p>Getting weather data...</p>
      )
    }
  }
};

Weather.propTypes = {
  lat: React.PropTypes.number,
  lon: React.PropTypes.number
};

Weather.defaultProps = {
 lat: 0,
 lon: 0
};

class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      lat: undefined,
      lon: undefined
    };
  };

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      });
    }
  };

  render() {
    if (this.state.lon && this.state.lat) {
      return (
        <div>
          <Weather lat={this.state.lat} lon={this.state.lon} />
        </div>
      )
    } else {
      return (
        <p>Getting location data...</p>
      )
    }
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
