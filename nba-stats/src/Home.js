import React, {useState, useEffect} from 'react';
import Axios from 'axios';

function Home() {

    let [playerList, setPlayerList] = useState([]);

    let players = [];

    let [playerName, setPlayerName] = useState("");

    let name;

    let data;

    const url = "https://www.balldontlie.io/api/v1/players?search=rui";

    const getPlayer = () => {
        Axios.get(url).then(async (response) => {
            console.log(response);

            await setPlayerName(response.data.data[0].first_name + " " + response.data.data[0].last_name);

            // let list = [];

            // for (let i = 0; i < response.data.data.length; i++) {
            //     list.push(response.data.data[i].first_name);
            // }

            // setPlayerList(response.data.data);

        });
    }

    getPlayer();

    return (
        <header className="App-header">

            <h1>NBA Stats</h1> 

            <h4>Player Search:</h4>
            <input></input>
            
            <div>
                <p>{playerName}</p>
            </div>
            
        </header>
    )
}

export default Home;