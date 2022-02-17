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

    let [filteredGames, setFilteredGames] = useState([]);

    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let year = today.getFullYear();

    let season = (month <= 5 ? year - 1 : year);

    let [lastTenGameIds, setLastTenGameIds] = useState([]);

    let [lastTenPlayerStats, setLastTenPlayerStats] = useState([]);

    // get the player season average stats from the API
    const url = "https://www.balldontlie.io/api/v1/season_averages?season=" + season + "&player_ids[]=" + props.player;

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
    const getGameStats = () => {
        const gameURL = "https://www.balldontlie.io/api/v1/games?seasons[]=" + season + "&per_page=100&team_ids[]=" + team;

        Axios.get(gameURL).then(async (response) => {

            let games = [];

            for (let i = 0; i < response.data.data.length; i++) {
                games.push(response.data.data[i]);
            }

            // store all of the games into gameIds state
            setGameIds(games);
        })

        // sort the games by ID so that we get the newest ones first
        if (gameIds.length > 0) {

            gameIds.sort((a, b) => (a.id > b.id) ? -1 : 1);

            // remove games that haven't happened eyt
            filteredGames = (gameIds.filter((game => {
                let split = game.date.toString().split("").splice(0,10);
                split = split.filter(letter => letter != '-');
                let yearComp = parseInt(split.splice(0,4).join(""));
                let monthComp = parseInt(split.splice(0, 2).join(""));
                let dayComp = parseInt(split.splice(0, 2).join(""));

                if (yearComp == year && monthComp <= month && dayComp < day) {
                    return true;
                } else if (yearComp < year) {
                    return true;
                }
                
                return false;
            })));

            setFilteredGames(filteredGames.splice(10));

        } 

        // console.log(gameIds);
        // console.log(filteredGames);
    }

    //get stats for player in those last 10 games
    const getLastTenStats = () => {

        for (let i = 0; i < filteredGames.length; i++) {
            setLastTenGameIds(lastTenGameIds => [...lastTenGameIds, filteredGames[i].id]);
        }

        const statsUrl = "https://www.balldontlie.io/api/v1/stats/?player_ids[]=" + props.player + "&game_ids[]=" + lastTenGameIds[0] + "&game_ids[]=" + lastTenGameIds[1] + "&game_ids[]=" + lastTenGameIds[2] + "&game_ids[]=" + lastTenGameIds[3] + "&game_ids[]=" + lastTenGameIds[4] + "&game_ids[]=" + lastTenGameIds[5] + "&game_ids[]=" + lastTenGameIds[6] + "&game_ids[]=" + lastTenGameIds[7] + "&game_ids[]=" + lastTenGameIds[8] + "&game_ids[]=" + lastTenGameIds[9];

        Axios.get(statsUrl).then(async (response) => {
            
            let temp = [];
            for (let i = 0; i < response.data.data.length; i++) {
                temp.push(response.data.data[i]);
            }

            setLastTenPlayerStats(temp);

            lastTenPlayerStats.sort((a, b) => (a.game.id > b.game.id) ? -1 : 1);

        })

        console.log(lastTenPlayerStats);

    }

    const updateStats = () => {
        getGameStats();
        getLastTenStats();
    }

    useEffect(() => {
        getStats();
        getPlayerName();
        getGameStats();
        getLastTenStats();
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

            <button onClick={updateStats}>Refresh</button>

            <h3>{name} Last 10 Games:</h3>
            <ul>
                {lastTenPlayerStats.map( (game) => {
                    return <li key={game.game.id}>Points: {game.pts} Assists: {game.ast} Rebounds: {game.reb} 3s Made: {game.fg3m}</li>
                } )}
            </ul>

        </div>
    )

}

export default Stats;