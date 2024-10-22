import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css'
import { store } from './Components/Redux/Store.jsx';

createRoot(document.getElementById('root')).render(
  <Router>
    <Provider store = {store}>
  <StrictMode>
    <App />
  </StrictMode>
  </Provider>
  </Router>
  ,
)
