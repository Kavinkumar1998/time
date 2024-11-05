import { useState } from 'react'
import { Routes,Route } from 'react-router-dom'
import './App.css'
import TimeByLocation from './Components/clock/TimeByLocation'
import bg3 from "./assets/bg3.jpg"
import 'leaflet/dist/leaflet.css';
import MainClock from './Components/clock/Clock'

function App() {


  return (
     <div className="min-h-screen w-full bg-cover bg-center p-0" style={{ backgroundImage: `url(${bg3})` }}>
   
       <Routes>
       <Route path="/" element={<MainClock/>} />
       <Route path="/:city" element={<TimeByLocation/>} />
       </Routes>
 </div>
  )
}

export default App
