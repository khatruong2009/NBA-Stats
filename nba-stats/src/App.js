import './App.css';
import Home from "./Components/Home";
import Stats from "./Components/Stats";
import {BrowserRouter, Route, Routes, Link, NavLink} from "react-router-dom";

function App() {
  return (
    <div className="App">

      <BrowserRouter>

        <Routes>

          <Route path="/" element={<Home/>}/>
          <Route path="/stats" element={<Stats/>}/>

        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;
