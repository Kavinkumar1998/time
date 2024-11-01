import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLocation, getTime, getWeather } from '../Redux/Slice';
import { MapContainer, TileLayer, Marker,Popup } from 'react-leaflet'
import Clock from 'react-clock'

import 'react-clock/dist/Clock.css';

const MainClock = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { Time, Location,Weather, isLoading } = useSelector((state) => state.time);

  const [currentLocalTime, setCurrentLocalTime] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [worldTimes, setWorldTimes] = useState({});
  const [searchInput, setSearchInput] = useState(''); // For search input
 const [position, setPosition] = useState([])
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: ''
  });
  const [value, setValue] = useState(new Date());

  const cities = [
    { name: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { name: 'Beijing', timeZone: 'Asia/Shanghai' },
    { name: 'Paris', timeZone: 'Europe/Paris' },
    // { name: 'London', timeZone: 'Europe/London' },
    // { name: 'New York', timeZone: 'America/New_York' },
    // { name: 'Los Angeles', timeZone: 'America/Los_Angeles' },
    // { name: 'Sydney', timeZone: 'Australia/Sydney' },
    // { name: 'Dubai', timeZone: 'Asia/Dubai' },
    // { name: 'Moscow', timeZone: 'Europe/Moscow' }
  ];


  const otherCities =[
    "Abu Dhabi", "Addis Ababa", "Amman", "Amsterdam", "Antananarivo", 
    "Athens", "Auckland", "Baghdad", "Bangkok", "Barcelona", 
    "Beijing", "Beirut", "Berlin", "Bogotá", "Boston", 
    "Brussels", "Buenos Aires", "Cairo", "Cape Town", "Caracas", 
    "Chicago", "Damascus", "Delhi", "Dhaka", "Dubai", 
    "Dublin", "Frankfurt", "Guangzhou", "Hanoi", "Havana", 
    "Helsinki", "Hong Kong", "Honolulu", "Istanbul", "Jakarta", 
    "Karachi", "Kathmandu", "Kinshasa", "Kuala Lumpur", "Kyiv", 
    "Lagos", "Las Vegas", "Lima", "London", "Los Angeles", 
    "Luanda", "Madrid", "Manila", "Mecca", "Mexico City", 
    "Miami", "Milan", "Moscow", "Mumbai", "New Delhi", 
    "New York", "Nuuk", "Osaka", "Oslo", "Paris", 
    "Prague", "Reykjavik", "Rio de Janeiro", "Riyadh", "Rome", 
    "Saint Petersburg", "San Francisco", "Santiago", "Seoul", "Shanghai", 
    "Shenzhen", "Singapore", "Stockholm", "Sydney", "São Paulo", 
    "Taipei", "Tehran", "Tel Aviv", "Tokyo", "Toronto", 
    "Vancouver", "Vienna", "Warsaw", "Washington, D.C.", "Yangon"
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, error: '' });
        },
        (error) => {
          setLocation((prevState) => ({
            ...prevState,
            error: 'Unable to retrieve your location'
          }));
        }
      );
    } else {
      setLocation((prevState) => ({
        ...prevState,
        error: 'Geolocation is not supported by your browser'
      }));
    }
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const data = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      const positionData =[location.latitude, location.longitude]
      setPosition(positionData)
      dispatch(getLocation(data));
      dispatch(getTime(data));
      dispatch(getWeather(data));
    }
  }, [dispatch, location.latitude, location.longitude]);

  useEffect(() => {
    // Check if Time data is valid
    if (Time?.statusCode === 200 && Time?.data?.currentLocalTime) {
      const initialLocalTime = new Date(Time.data.currentLocalTime);
      setCurrentLocalTime(initialLocalTime);

      // Start ticking the local time by 1 second every second
      const intervalId = setInterval(() => {
        setCurrentLocalTime((prevTime) => new Date(prevTime.getTime() + 1000));

        // Update world times for each city
        const updatedWorldTimes = {};
        cities.forEach((city) => {
          const cityTime = new Date().toLocaleTimeString('en-US', {
            timeZone: city.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          updatedWorldTimes[city.name] = cityTime;
        });
        setWorldTimes(updatedWorldTimes);
      }, 1000); // Runs every second

      return () => clearInterval(intervalId); // Cleanup on unmount
    } else {
      console.error('Invalid Time data:', Time);
    }
  }, [Time?.statusCode, Time?.data?.currentLocalTime]); // Depend only on statusCode and currentLocalTime
  

  useEffect(() => {
    if (currentLocalTime) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formatted = currentLocalTime.toLocaleDateString(undefined, options);
      setFormattedDate(formatted);

      const firstJan = new Date(currentLocalTime.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((currentLocalTime - firstJan) / (1000 * 60 * 60 * 24) + 1);
      const week = Math.ceil(dayOfYear / 7);
      setWeekNumber(week);
    }
  }, [currentLocalTime]);

  const locationData = Location?.data?.address || {};
  const { town, state_district, state, postcode,country } = locationData;
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
  const navigateToCity=(city)=>{

    const Input = formattedInput(city);
    console.log(Input)
 
    navigate(`/timebylocation/${Input}`);
  }
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


    <div style= {{height: "100vh"}} >

      {isLoading ? (
        <p>Loading...</p>
      ) : (
    <div className="">
   <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Centers horizontally
    justifyContent: "center", // Centers vertically
    width: "60vw",
    height: "80vh", // Must have a height to enable vertical centering
    textAlign: "center",
    margin: "0 auto", // Centers the container itself horizontally if needed
  }}
>
  <span className='text-4xl font-bold text-white'>
    Time in {town || ''} {state_district || 'N/A'}, {state || 'N/A'}, {country || 'N/A'} now:
  </span>
  <p className="text-9xl font-bold text-white">
    {currentLocalTime.toLocaleTimeString()}
  </p>
  <span className='text-4xl font-bold text-white'>
    {formattedDate}, week {weekNumber}
  </span>
<div>
        
          <div>
          <span className='text-lg font-bold text-white'>{temp_c}°C Feels like {feelslike_c}°C</span>
            </div>
            <div>
            <div className="flex justify-center items-center space-x-2">
  <img src={icon} alt="Weather icon" className="w-8 h-8" />
  <span className="text-lg font-bold text-white">{text}</span>
</div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div >         
              <span className='text-lg font-bold text-white'>Humidity :{humidity}% </span>
               </div>
               <div>         
              <span className='text-lg font-bold text-white'>Pressure : {pressure_mb} mb</span>
               </div>
               <div>         
              <span className='text-lg font-bold text-white'>Visibility :{vis_km} km </span>
               </div>
               <div >         
              <span className='text-lg font-bold text-white'>Dewpoint : {dewpoint_c}°C</span>
               </div>
               <div >         
              <span className='text-lg font-bold text-white'>Wind : {wind_kph} km/h {wind_dir}<span className="ml-2 text-2xl font-bold text-white"
              style={{ display: "inline-block", transform: `rotate(${windRotationAngle}deg)` }}>
          ↑
        </span></span>
               </div>
               <div >         
              <span className='text-lg font-bold text-white'>UV Index : {uv} </span>
               </div>
            </div>
          </div>
  

</div>



        {(position && position.length === 2 && position[0] !== null && position[1] !== null) ? (
           <div style={{ height: "60vh" }}className="flex flex-row gap-4 min-h-screen w-full " >

          <div style={{height: "40vh", width: "50vw" }} >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div key={city.name} className="border rounded-lg p-8">
                
                <span className='text-xl font-bold text-white'>{city.name}: <span>{worldTimes[city.name] || 'Loading...'}</span><Clock value={worldTimes[city.name]} /></span>
              </div>
            ))}
          </div>
        </div>
        
  <div  style={{ height: "50vh", width: "50vw" }}>
    <MapContainer className='border rounded-lg'  center={position} zoom={10} scrollWheelZoom={true} style={{ height: "75%", width: "90%" }}>
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

      </div>
      )}    
      </div>
     
      <div className=" grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2 p-4 mt-8 pt-28">
  {otherCities.map((city) => (
    <div key={city} className="card p-4 ">
      <span className='text-xl font-bold text-white' onClick={() => navigateToCity(city)}>{city}</span>
    </div>
  ))}
</div>

    </div>
  );
};

export default MainClock;
