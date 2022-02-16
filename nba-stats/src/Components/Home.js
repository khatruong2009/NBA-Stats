import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import {BrowserRouter, Route, Routes, Link, NavLink} from "react-router-dom";
import Stats from './Stats';

function Home() {

    let [playerList, setPlayerList] = useState([]);

    let [selected, setSelected] = useState(0);

    let [search, setSearch] = useState("");

    let [playerSelected, setPlayerSelected] = useState(false);

    //get the player name from the API
    const url = "https://www.balldontlie.io/api/v1/players?per_page=10&search=" + search;

    const getPlayer = () => {
        Axios.get(url).then(async (response) => {

            // console.log(response);

            let list = [];

            for (let i = 0; i < response.data.data.length; i++) {
                list.push(response.data.data[i]);
            }

            setPlayerList(list);

        });
    }

    // console.log(playerList);

    // when player clicks search, search the api for it and display the name results
    const handleSearch = () => {
        getPlayer();  
    }

    // search when enter is pressed
    const handleKeyPress = (e) => {
        if (e.keyCode == 13) {
            handleSearch();
        }
    }

    // change styles for when a player is hovered over
    const handleHover = (e) => {
        e.target.style.background = 'white';
        e.target.style.color = '#282c34';
    }

    const handleLeave = (e) => {
        e.target.style.background = '#282c34';
        e.target.style.color = 'white';
    }

    // selected a player based on click
    const handleSelect = (e) => {
        setSelected(e.target.value);
        setPlayerSelected(true);
    }

    return (
        <header className="App-header">

            <h1>NBA Stats</h1> 

            <button onClick={() => window.location.reload(false)}>Restart Search</button>

            <h4>Player Search:</h4>
            <input onKeyDown={handleKeyPress} type="text" onChange={event => setSearch(event.target.value)}></input>
            <button onClick={handleSearch}>Search</button>
            
            <div className='results' style={{display: playerSelected ? "none" : "block"}}>

                <h5>Results:</h5>
                <ul>
                    {playerList.map(function(player) {
                        return  <li value = {player.id} onClick={handleSelect} onMouseOver={handleHover} onMouseLeave={handleLeave} className='playerList' key= {player.id}>{player.first_name} {player.last_name} - {player.team.full_name}</li>
                    })}
                </ul>
    
            </div>

            {playerSelected ? <Stats player={selected}/> : void(0)}
            
        </header>
    )
}

export default Home;