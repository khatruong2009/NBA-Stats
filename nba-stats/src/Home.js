import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import './App.css';

function Home() {

    let [playerList, setPlayerList] = useState([]);

    let [search, setSearch] = useState("");

    const url = "https://www.balldontlie.io/api/v1/players?search=" + search;

    const getPlayer = () => {
        Axios.get(url).then(async (response) => {
            console.log(response);

            let list = [];

            for (let i = 0; i < response.data.data.length; i++) {
                list.push(response.data.data[i]);
            }

            setPlayerList(list);

        });
    }

    useEffect(() => {
        //getPlayer();
    }, [])

    console.log(playerList);

    const handleSearch = () => {
        getPlayer();  
    }

    return (
        <header className="App-header">

            <h1>NBA Stats</h1> 

            <h4>Player Search:</h4>
            <input type="text" onChange={event => setSearch(event.target.value)}></input>
            <button onClick={handleSearch}>Search</button>
            
            <div className='results'>
                <h5>Results:</h5>
                <ul>
                    {playerList.map(function(player) {
                        return  <li className='playerList' key= {player.id}>{player.first_name} {player.last_name} - {player.team.full_name}</li>
                    })}
                </ul>
            </div>
            
        </header>
    )
}

export default Home;