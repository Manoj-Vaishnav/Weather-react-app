import { v4 as uuidv4 } from 'uuid'; 
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { WiCloud, WiDaySunny, WiRain, WiSnow, WiWindy, WiStrongWind } from 'react-icons/wi'; // Import weather icons
import { CiDroplet } from "react-icons/ci";
import { RiUmbrellaFill } from "react-icons/ri";

const App = () => {
  // State to manage user location input
  const [location, setLocation] = useState('Rudrapur,Uttarakhand');
  // State to store fetched weather data
  const [weatherData, setWeatherData] = useState(null);
  // State to store the weather report description
  const [weatherReport, setWeatherReport] = useState("It's clear sky");
  // State to toggle between Celsius and Fahrenheit temperature units
  const [isCelsius, setIsCelsius] = useState(true);
  // State to represent forecast days
  const [days, setDays] = useState([1, 2, 3, 4]);

  // API key for fetching geolocation
  const apiKey = 'cd7e77e09c7c498ca5141cdb79f2e52c';

  useEffect(() => {
    // Function to get geolocation data based on city name
    const getGeolocation = async (city) => {
      try {
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${city}&apiKey=${apiKey}`);
        return response.data.features[0].properties;
      } catch (error) {
        console.error('Error fetching geolocation:', error);
        return null;
      }
    };

    // Function to get weather data using latitude and longitude
    const getWeather = async (lat, lon) => {
      try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    // Function to handle the process of getting geolocation and then fetching weather data
    const handleSubmit = async () => {
      const geoData = await getGeolocation(location);
      if (geoData) {
        getWeather(geoData.lat, geoData.lon);
      }
    };
    handleSubmit();
  }, [location]); // Dependency on location to fetch data when location changes

  useEffect(() => {
    // Update weather report based on current weather code
    if (weatherData) {
      const code = weatherData.current.weather_code;
      if (code >= 0 && code <= 4) {
        setWeatherReport("It's clear.");
      } else if (code >= 45 && code <= 57) {
        setWeatherReport("It's mostly cloudy.");
      } else if (code >= 61 && code <= 67) {
        setWeatherReport("There's light rain.");
      } else if (code >= 71 && code <= 86) {
        setWeatherReport("It's snow fall.");
      } else if (code >= 95 && code <= 99) {
        setWeatherReport("It's Thunderstorm: Slight or moderate.");
      } else {
        setWeatherReport("It's clear.");
      }
    }
  }, [weatherData]); // Dependency on weatherData to update the report

  // Function to return appropriate weather icon based on weather code
  const getWeatherIcon = (code) => {
    if (code >= 0 && code <= 4) {
      return <WiDaySunny />;
    } else if (code >= 45 && code <= 57) {
      return <WiCloud />;
    } else if (code >= 61 && code <= 67) {
      return <WiRain />;
    } else if (code >= 71 && code <= 86) {
      return <WiSnow />;
    } else if (code >= 95 && code <= 99) {
      return <WiWindy />;
    } else {
      return <WiCloud />;
    }
  };

  // Function to get the day name from a date string
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  // Function to convert temperature between Celsius and Fahrenheit
  const convertTemperature = (tempCelsius) => {
    if (isCelsius) {
      return tempCelsius;
    } else {
      return ((tempCelsius * 9) / 5 + 32).toFixed(2);
    }
  };

  return (
    <div className="Header">
      {/* Location input and weather report */}
      <div className="input">
        Right now in <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{
        width: `${location.length + 1}ch`,
        border:'none',
        borderBottom: '1px solid black',
        outline: 'none',
        padding: '0px 2px 0px 8px',
        color:'#444',
        background: 'transparent',
        fontFamily:'sans-serif, Montserrat',
        fontSize:'large',
        fontWeight:'600'
      }}/> ,{weatherReport}
      </div>

      {/* Display current weather and forecast data */}
      {weatherData &&
        (<div className='main' key={uuidv4()}>
          <div className="mid_data">
            {/* Current weather icon and temperature */}
            <div className="weather_logo">{getWeatherIcon(weatherData.current.weather_code)}</div>
            <div className="temperature_current">{convertTemperature(weatherData.current.temperature_2m)}°{isCelsius ? 'C' : 'F'}</div>

            {/* Other weather details (wind speed, rain, humidity) */}
            <div className="other_report">
              <li><WiStrongWind />{' '}{weatherData.current.wind_speed_10m}<span className='unit'>mph</span></li>
              <li><RiUmbrellaFill />{' '}{weatherData.current.rain}<span className='unit'>%</span></li>
              <li><CiDroplet />{' '}{weatherData.current.relative_humidity_2m}<span className='unit'>%</span></li>
            </div>
          </div>

          {/* Forecast for the upcoming days */}
          <div className="end_data">
            <div className="days">
              {
                days.map((index) => {
                  return (<ul key={uuidv4()}>
                    <li className="weather">
                      {getWeatherIcon(weatherData.daily.weather_code[index])}
                    </li>
                    <li className="temperature">
                      {`${convertTemperature(weatherData.daily.temperature_2m_min[index])}/${convertTemperature(weatherData.daily.temperature_2m_max[index])}°${isCelsius ? 'C' : 'F'}`}
                    </li>
                    <li className="time">
                      {getDayName(weatherData.daily.time[index])}
                    </li>
                  </ul>)
                })
              }
            </div>
          </div>
        </div>
        )
      }

      {/* Buttons to toggle between Celsius and Fahrenheit */}
      <div className="buttons">
        <button onClick={() => setIsCelsius(true)} style={{color: isCelsius ? 'black' : 'gray',outline: 'none'}}>°C</button>
        <span style={{ padding: '0 5px' }}>|</span>
        <button onClick={() => setIsCelsius(false)} style={{color: !isCelsius ? 'black' : 'gray',outline: 'none'}}>°F</button>
      </div>
    </div>
  );
}

export default App;
