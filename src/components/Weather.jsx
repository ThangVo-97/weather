import React, {useState, useEffect, useContext} from 'react'
import {ThemeContext} from '../context/ThemeContext'
import {FaSearch, FaTrash} from 'react-icons/fa'
import './Weather.css'

const API_KEY = process.env.REACT_APP_API_WEATHER_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// Helper function to load from localStorage
const loadSearchHistory = () => {
  try {
    const savedHistory = localStorage.getItem('weathersearchHistories');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Failed to parse search history', error);
    return [];
  }
};


const Weather = () => {
  const {theme, toggleTheme} = useContext(ThemeContext)
  const [searchCity, setSearchCity] = useState('')
  const [searchCountry, setSearchCountry] = useState('')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchHistories, setSearchHistories] = useState(loadSearchHistory())

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('weathersearchHistories', JSON.stringify(searchHistories))
  }, [searchHistories])

  const fetchWeatherData = async (city, country) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&appid=${API_KEY}&units=metric`
      )

      if (!response.ok) {
        throw new Error('Location not found. Please try another city.')
      }

      const data = await response.json()

      const weatherData = {
        temperature: Math.round(data.main.temp),
        high: Math.round(data.main.temp_max),
        low: Math.round(data.main.temp_min),
        location: `${data.name}, ${data.sys.country}`,
        time: new Date().toLocaleString(),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      }

      setCurrentWeather(weatherData)

      // Add to search history if not already there
      const locationString = `${data.name}, ${data.sys.country}`
      setSearchHistories(prev => [
        {location: locationString, time: new Date().toLocaleString()},
        ...prev.filter(item => item.location !== locationString)
      ])

    } catch (err) {
      setError(err.message)
      setCurrentWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchCity.trim() && !searchCountry.trim()) return
    fetchWeatherData(searchCity, searchCountry)
    setSearchCity('')
    setSearchCountry('')
  }

  const handlesearchHistoryItem = (location) => {
    fetchWeatherData(location.split(',')[0].trim(), location.split(',')[1].trim())
  }

  const clearHistory = () => {
    setSearchHistories([])
  }

  const handleDeleteHisotyItem = (location) => {
    let tempHistories = searchHistories
    const deleteItemIndex = tempHistories.findIndex(x => x.location === location)
    tempHistories = tempHistories.filter((_, idx) => idx !== deleteItemIndex)
    setSearchHistories(tempHistories)
  }

  return (
    <div className={`weather-app ${theme}-theme`}>
      <div className="theme-toggle-container">
        <h2 className='app-name'>Today's Weather</h2>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className='search-input-container'>
          <h3 className="search-title">City:</h3>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search for a city..."
            className="search-input"
            disabled={loading}
          />
        </div>

        <div className='search-input-container'>
          <h3 className="search-title">Country:</h3>
          <input
            type="text"
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
            placeholder="Search for a country..."
            className="search-input"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="search-button"
          disabled={loading || (!searchCity.trim() && !searchCountry.trim())}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading-spinner"></div>}

      {currentWeather && !loading && (
        <div className="current-weather">
          <h2>{currentWeather.location}</h2>
          <div className="weather-header">
            <div>
              {currentWeather.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`}
                  alt={currentWeather.description}
                  className="weather-icon"
                />
              )}
              <div className="temperature">{currentWeather.temperature}°C</div>
            </div>
            <div className="weather-description">{currentWeather.description}</div>
          </div>
          <div className="high-low">Temperature: {currentWeather.low}°C ~ {currentWeather.high}°C</div>
          <div className="time">Time: {currentWeather.time}</div>
          <div className="humidity">Humidity: {currentWeather.humidity}%</div>
        </div>
      )}

      <div className="search-history">
        <div className="history-header">
          <h3>Search History</h3>
          {searchHistories.length > 0 && (
            <button onClick={clearHistory} className="clear-history">
              Clear
            </button>
          )}
        </div>
        {searchHistories.length === 0 ? (
          <div className="empty-history">No search history yet</div>
        ) : (
          <ul style={{padding: '0'}}>
            {searchHistories.map((item, index) => (
              <li
                key={index}
                className="history-item"
              >
                <div className="location">{item.location}</div>
                <span className="time">{item.time}</span>
                <div className='history-action-container'>
                  <button className='search-item' onClick={() => handlesearchHistoryItem(item.location)}>
                    <FaSearch style={{color: "#555", fontSize: "14px"}} />
                  </button>

                  <button className='delete-item'
                    onClick={() => handleDeleteHisotyItem(item.location)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Weather