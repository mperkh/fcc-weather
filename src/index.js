import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import reqwest from 'reqwest';
import './index.css'
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Image } from 'react-bootstrap';
import { Panel } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

/*
// Include React Bootstrap Components for Codepen
const Grid = ReactBootstrap.Grid;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Button = ReactBootstrap.Button;
const Image = ReactBootstrap.Image;
const Panel = ReactBootstrap.Panel;
const Alert = ReactBootstrap.Alert;
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
      error: undefined,
      temp: undefined,
      main: undefined,
      icon: undefined,
    };
  };

  getWeather() {

    const url = [
      'https://api.forecast.io/forecast/de40f00fe24e6e53fcae302b0d12efe9/',
      this.props.lat,
      ',',
      this.props.lon
    ].join('');

    reqwest({
      url: url,
      type: 'jsonp',
      success: (weather) => {
        const w = weather.currently;
        if (w.temperature && w.summary && w.icon) {
          this.setState({
            temp: w.temperature,
            main: w.summary,
            icon: w.icon,
          });
        } else {
          this.setState({
            error: true
          });
        }
      },
      error: () => {
        this.setState({
          error: true
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

    let fetchStatus;

    if (!this.state.error && this.state.temp && this.state.main && this.state.icon) {
      fetchStatus = (
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
      );
    } else if (this.state.error) {
      fetchStatus = (
        <Alert bsStyle="danger">
          <strong>Status:</strong> Unable to get weather data.
        </Alert>
      );
    } else {
      fetchStatus = (
        <Alert bsStyle="info">
          <strong>Status:</strong> Getting weather data...
        </Alert>
      );
    }

    return (
      <div id="weather">
        {fetchStatus}
      </div>
    )
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
      lon: undefined,
      status: undefined
    };
  };

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            status: 'success',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        error => {
          this.setState({
            status: 'error'
          });
        }
      );
    }
  };

  render() {

    let appSwitch;

    switch (this.state.status) {
      case 'success':
        appSwitch = <Weather lat={this.state.lat} lon={this.state.lon} />;
        break;
      case 'error':
        appSwitch = (
          <Alert bsStyle="danger">
            <strong>Status:</strong> Unable to determine location.
          </Alert>
        );
        break;
      default:
        appSwitch = (
          <Alert bsStyle="info">
            <strong>Status:</strong> Getting location data...
          </Alert>
        );
    }

    return (
      <Grid>
        <Row className="show-grid">
          <Col md={6} mdOffset={3}>
            {appSwitch}
          </Col>
        </Row>
      </Grid>
    )
  };
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
