import logo from './logo.svg';
import './App.css';
import {ThemeProvider} from './context/ThemeContext';
import Weather from './components/Weather';

function App() {
  return (
    <ThemeProvider>
      <div className='App'>
        <Weather />
      </div>
    </ThemeProvider>
  );
}

export default App;
