import React, { useEffect, useState } from 'react';
import { useNavigate,useParams  } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCoordinates, getTime, getWeather } from '../Redux/Slice'; // Import the actions from your Redux slice
import { MapContainer, TileLayer, Marker,Popup } from 'react-leaflet'
const TimeByLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: ''
  });
  const [currentLocalTime, setCurrentLocalTime] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(''); 
  const [position, setPosition] = useState([])
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { city } = useParams(); 
  // Get state data from Redux
  const { Time, Location,Weather, isLoading, error: reduxError } = useSelector((state) => state.time);



  useEffect(() => {
    if (city) {
    
      dispatch(getCoordinates(city));  // Dispatch the lat/lon to get the time
    }
  }, [city, dispatch]);  // Location is a dependency, so the effect will run when Location changes


  const handleSearch = (e) => {
    e.preventDefault();
  
    if (searchInput) {
      const Input = formattedInput(searchInput)
// Replace spaces with underscores
      navigate(`/timebylocation/${Input}`);
    } else {
      console.log('Please enter a valid location');
    }
  };

  const formattedInput =(Input)=>{ return Input.trim().replace(/\s+/g, '_'); }


  // When coordinates are available, dispatch the getTime action to fetch time
  useEffect(() => {
    if (Location?.data?.length > 0) {
      const coordinates = {
        latitude: Location.data[0].lat,
        longitude: Location.data[0].lon,
      };
      setPosition([coordinates.latitude, coordinates.longitude]);
      dispatch(getTime(coordinates));
      dispatch(getWeather(coordinates));
    }
  }, [Location, dispatch]);

  // Update local time every second
  useEffect(() => {
    if (Time?.data?.currentLocalTime) {
      const initialTime = new Date(Time.data.currentLocalTime);
      setCurrentLocalTime(initialTime);

      const intervalId = setInterval(() => {
        setCurrentLocalTime((prevTime) => {
          const updatedTime = new Date(prevTime.getTime() + 1000);
          return updatedTime;
        });
      }, 1000);

      return () => clearInterval(intervalId); // Clean up interval on unmount
    }
  }, [Time]);

  // Format the date and calculate the week number
  useEffect(() => {
    if (currentLocalTime) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formatted = currentLocalTime.toLocaleDateString(undefined, options);
      setFormattedDate(formatted);

      // Calculate the week number
      const firstJan = new Date(currentLocalTime.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((currentLocalTime - firstJan) / (1000 * 60 * 60 * 24) + 1);
      const week = Math.ceil(dayOfYear / 7);
      setWeekNumber(week);
    }
  }, [currentLocalTime]);
  const WeatherData = Weather?.data ?.current|| {};
  const { dewpoint_c,feelslike_c,heatindex_c,humidity,pressure_mb,temp_c,uv,vis_km,wind_degree,wind_dir,wind_kph}= WeatherData
  console.log(WeatherData)
 const weatherCondition = Weather?.data ?.current.condition|| {};
 const {text,icon}=weatherCondition
  const windDirectionsToDegrees = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5
  };

  // Retrieve the rotation angle for the current wind direction
  const windRotationAngle = windDirectionsToDegrees[wind_dir] || 0;
  return (
    <div className="pt-8">
  
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <div className="flex justify-center items-center mt-8">
  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
    <input
      type="text"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Enter location"
      required
      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <button
      type="submit"
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} shadow-md transition duration-300 ease-in-out`}
    >
      {isLoading ? 'Loading...' : 'Get Time'}
    </button>
  </form>
</div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {reduxError && <p style={{ color: 'red' }}>{reduxError}</p>}

      <div  >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {Time?.data && (
<div>
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Centers horizontally
    justifyContent: "center", // Centers vertically
    width: "60vw",
    height: "50vh", // Must have a height to enable vertical centering
    textAlign: "center",
    margin: "0 auto", // Centers the container itself horizontally if needed
  }}>
         
         <span className='text-4xl font-bold text-white'>Time in {city} now :</span>
         <p className="text-9xl font-bold text-white">{new Date(currentLocalTime).toLocaleTimeString()}</p>
         <span className='text-4xl font-bold text-white'>{formattedDate}, week {weekNumber}</span>
         <div>
          <span className='text-4xl font-bold text-white'>
            WEATHER in {city} now:
          </span>
          <div>
          <span className='text-xl font-bold text-white'>{temp_c}°C Feels like {feelslike_c}°C</span>
            </div>
            <div>
            <div className="flex justify-center items-center space-x-2">
  <img src={icon} alt="Weather icon" className="w-8 h-8" />
  <span className="text-xl font-bold text-white">{text}</span>
</div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>Humidity :{humidity}% </span>
               </div>
               <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>Pressure : {pressure_mb} mb</span>
               </div>
               <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>Visibility :{vis_km} km </span>
               </div>
               <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>Dewpoint : {dewpoint_c}°C</span>
               </div>
               <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>Wind : {wind_kph} km/h {wind_dir}<span className="ml-2 text-2xl font-bold text-white"
              style={{ display: "inline-block", transform: `rotate(${windRotationAngle}deg)` }}>
          ↑
        </span></span>
               </div>
               <div  className="border rounded-lg p-8">         
              <span className='text-xl font-bold text-white'>UV Index : {uv} </span>
               </div>
            </div>
          </div>
          </div>
          

          {(position && position.length === 2 && position[0] !== null && position[1] !== null) ? (
     
     <div style={{ height: "40vh" }}className="flex flex-row gap-4 min-h-screen w-full mt-8 " >

<div  className="card border rounded-lg"style={{height: "40vh", width: "50vw" }}></div> 

<div  style={{ height: "50vh", width: "50vw" }}>
    <MapContainer className='border rounded-lg' center={position} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "90%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  </div>
  </div>
) : (
  <div>Loading...</div>
)}
</div>   )}
        </div>
          )}

      </div>
    </div>
    </div>
  );
};

export default TimeByLocation;
