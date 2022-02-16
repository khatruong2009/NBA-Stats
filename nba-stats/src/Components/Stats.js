import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import { useLocation } from "react-router-dom";

function Stats(props) {

    let [points, setPoints] = useState();
    let [assists, setAssists] = useState();
    let [rebounds, setRebounds] = useState();
    let [threes, setThrees] = useState();

    // get the player season average stats from the API
    const url = "https://www.balldontlie.io/api/v1/season_averages?season=2021&player_ids[]=" + props.player;

    const getStats = () => {
        Axios.get(url).then(async (response) => {

            setPoints(response.data.data[0].pts);
            setAssists(response.data.data[0].ast);
            setRebounds(response.data.data[0].reb);
            setThrees(response.data.data[0].fg3m);

        });
    }

    let [name, setName] = useState("");

    // get player name from API
    const nameURL = "https://www.balldontlie.io/api/v1/players/" + props.player;

    const getPlayerName = () => {

        Axios.get(nameURL).then(async (response) => {

            await setName(response.data.first_name + " " + response.data.last_name);

        })

    }

    useEffect(() => {
        getStats();
        getPlayerName();
    },[])

    return (
        <div className='App-header' style={{minHeight: "0"}}>
            <h3>{name} Season Averages: </h3>
            {/* <ul>
                <li>Points: {points}</li>
                <li>Assists: {assists}</li>
                <li>Rebounds: {rebounds}</li>
                <li>3s per Game: {threes}</li>
            </ul> */}

            <table>
                <tbody>
                    <tr className='headerRow'>
                        <th>Statistic</th>
                        <th className='stat'>Average</th>
                    </tr>
                    <tr>
                        <td>Points:</td>
                        <td className='stat'>{points}</td>
                    </tr>
                    <tr>
                        <td>Assists:</td>
                        <td className='stat'>{assists}</td>
                    </tr>
                    <tr>
                        <td>Rebounds:</td>
                        <td className='stat'>{rebounds}</td>
                    </tr>
                    <tr>
                        <td>3s Made Per Game:</td>
                        <td className='stat'>{threes}</td>
                    </tr>
                </tbody>
                
            </table>
        </div>
    )

}

export default Stats;