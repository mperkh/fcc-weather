import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import $ from 'jquery';
import './index.css'
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Image } from 'react-bootstrap';
import { Panel } from 'react-bootstrap';

/*
const Grid = ReactBootstrap.Grid;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Button = ReactBootstrap.Button;
const Image = ReactBootstrap.Image;
const Panel = ReactBootstrap.Panel;
*/

class Map extends React.Component {
  render() {
    return (
      <div id="map">
        <Image src={"https://maps.google.com/maps/api/staticmap?markers=" +
          this.props.lat +
          "," +
          this.props.lon +
          "&maptype=terrain&size=400x300&scale=2"}
          alt="Map location" responsive />
      </div>
    )
  };
};

Map.propTypes = {
  lat: React.PropTypes.number,
  lon: React.PropTypes.number
};

class WeatherIcon extends React.Component {
  getApiIcon (icon) {
    const icons = {
      'clear-day': 'wi wi-forecast-io-clear-day',
      'clear-night': 'wi wi-forecast-io-clear-night',
      'rain': 'wi wi-forecast-io-rain',
      'snow': 'wi wi-forecast-io-snow',
      'sleet': 'wi wi-forecast-io-sleet',
      'wind': 'wi wi-forecast-io-wind',
      'fog': 'wi wi-forecast-io-fog',
      'cloudy': 'wi wi-forecast-io-cloudy',
      'partly-cloudy-day': 'wi wi-forecast-io-partly-cloudy-day',
      'partly-cloudy-night': 'wi wi-forecast-io-partly-cloudy-night',
      'hail': 'wi wi-forecast-io-hail',
      'thunderstorm': 'wi wi-forecast-io-thunderstorm',
      'tornado': 'wi wi-forecast-io-tornado',
    };
    return icons[icon];
  };

  render() {
    return (
      <div id="weather-icon">
        <i className={this.getApiIcon(this.props.icon)}></i>
      </div>
    )
  };
}

WeatherIcon.propTypes = {
  icon: React.PropTypes.string
};

class Temperature extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      celsius: true
    };
    this.switchUnit = this.switchUnit.bind(this);
  };

  getTemperature(fahrenheit) {
    if (this.state.celsius) {
      return Number(((fahrenheit - 32) / 1.8).toFixed(1)) + " °C";
    } else {
      return Number((fahrenheit).toFixed(1)) + " °F";
    }
  };

  switchUnit() {
    const newState = !this.state.celsius;
    this.setState({celsius: newState});
  };

  render() {
    return (
      <div id="temperature">
        <h1>{this.getTemperature(this.props.fahrenheit)}</h1>
        <Button onClick={this.switchUnit} bsStyle="primary">°C / Fahrenheit</Button>
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
      icon: '',
    };
  };

  getWeather() {

    const url = [
      'https://api.forecast.io/forecast/de40f00fe24e6e53fcae302b0d12efe9/',
      this.props.lat,
      ',',
      this.props.lon
    ].join('');

    $.ajax({
      url: url,
      dataType: 'jsonp',
      success: (weather) => {
        this.setState({
          temp: weather.currently.temperature,
          main: weather.currently.summary,
          icon: weather.currently.icon,
        });
      }
    });
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
        <Panel header="Show the Local Weather" bsStyle="primary">
          <div className="text-center">
            <Map lat={this.props.lat} lon={this.props.lon} />
            <WeatherIcon icon={this.state.icon} />
            <p className="lead">
              {this.state.main}
            </p>
            <Temperature fahrenheit={this.state.temp} />
          </div>
        </Panel>
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
        <Grid>
          <Row className="show-grid">
            <Col xs={6} xsOffset={3}>
              <Weather lat={this.state.lat} lon={this.state.lon} />
            </Col>
          </Row>
        </Grid>
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
