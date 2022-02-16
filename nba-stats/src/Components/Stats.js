import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import { useLocation } from "react-router-dom";

function Stats(props) {

    let [points, setPoints] = useState();
    let [assists, setAssists] = useState();
    let [rebounds, setRebounds] = useState();
    let [threes, setThrees] = useState();
    let [name, setName] = useState("");

    let [team, setTeam] = useState(0);

    let [gameIds, setGameIds] = useState([]);

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

    // get player name from API
    const nameURL = "https://www.balldontlie.io/api/v1/players/" + props.player;

    const getPlayerName = () => {

        Axios.get(nameURL).then(async (response) => {

            setName(response.data.first_name + " " + response.data.last_name);
            setTeam(response.data.team.id);

        })

    }

    // get last 10 game stats
    const gameURL = "https://www.balldontlie.io/api/v1/games?seasons[]=2021&per_page=100&team_ids[]=" + team;

    const getGameStats = () => {
        Axios.get(gameURL).then(async (response) => {

            console.log(await response.data);

            let games = [];
            for (let i = 0; i < response.data.data.length; i++) {
                games.push(response.data.data[i]);
            }

            setGameIds(games);
        })
    }

    console.log(gameIds);

    useEffect(() => {
        getStats();
        getPlayerName();
        getGameStats();
    },[])

    return (
        <div className='App-header' style={{minHeight: "0"}}>
            <h3>{name} Season Averages: </h3>

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

            <button onClick={getGameStats}>Refresh</button>

        </div>
    )

}

export default Stats;