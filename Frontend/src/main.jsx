
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux';
import store from './Store.js';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
    <App />
  </BrowserRouter>

  </Provider>
)