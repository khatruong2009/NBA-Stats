import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js/auto';
  import { Bar } from 'react-chartjs-2';

function Stats(props) {

    let [points, setPoints] = useState();
    let [assists, setAssists] = useState();
    let [rebounds, setRebounds] = useState();
    let [threes, setThrees] = useState();
    let [name, setName] = useState("");

    let [team, setTeam] = useState(0);

    let [filteredGames, setFilteredGames] = useState();

    let [series, setSeries] = useState([]);

    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let year = today.getFullYear();

    let season = (month <= 5 ? year - 1 : year);

    let [lastTenGameIds, setLastTenGameIds] = useState([]);

    let [lastTenPlayerStats, setLastTenPlayerStats] = useState([]);

    let [data, setData] = useState({
        labels: [],
        datasets: [{
            label: "Points per Game",
            data: [],
        }]
    });

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Last 10 Games',
          },
        },
      };

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
            getGameStats(response.data.team.id);
            setName(response.data.first_name + " " + response.data.last_name);
            setTeam(response.data.team.id);
        })

    }

    // get last 10 game stats
    const getGameStats = (teamId) => {
        const gameURL = "https://www.balldontlie.io/api/v1/games?seasons[]=" + season + "&per_page=100&team_ids[]=" + teamId;

        Axios.get(gameURL).then(async (response) => {

            let games = [];

            for (let i = 0; i < response.data.data.length; i++) {
                games.push(response.data.data[i]);
            }

            // sort the games by ID so that we get the newest ones first
            if (games.length > 0) {

                games.sort((a, b) => (a.id > b.id) ? -1 : 1);

                // remove games that haven't happened eyt
                games = (games.filter((game => {
                    let split = game.date.toString().split("").splice(0,10);
                    split = split.filter(letter => letter != '-');
                    let yearComp = parseInt(split.splice(0,4).join(""));
                    let monthComp = parseInt(split.splice(0, 2).join(""));
                    let dayComp = parseInt(split.splice(0, 2).join(""));

                    if (yearComp == year && monthComp < month) {
                        return true;
                    } else if (yearComp < year) {
                        return true;
                    } else if (yearComp == year && monthComp == month && dayComp < day) {
                        return true;
                    }
                    
                    return false;
                })));

                games = games.splice(0, 10);
                // console.log(games);

                getLastTenStats(games);
                setFilteredGames(games);
            } 
        })
    }

    //get stats for player in those last 10 games
    const getLastTenStats = (games) => {

        //transfer game ids to a temp variable so we don't have to rely on state
        let temp1 = [];
        for (let i = 0; i < games.length; i++) {
            temp1.push(games[i].id);
        }

        setLastTenGameIds(temp1);

        //get the stats from the last 10 games using gameids
        const statsUrl = "https://www.balldontlie.io/api/v1/stats/?player_ids[]=" + props.player + "&game_ids[]=" + temp1[0] + "&game_ids[]=" + temp1[1] + "&game_ids[]=" + temp1[2] + "&game_ids[]=" + temp1[3] + "&game_ids[]=" + temp1[4] + "&game_ids[]=" + temp1[5] + "&game_ids[]=" + temp1[6] + "&game_ids[]=" + temp1[7] + "&game_ids[]=" + temp1[8] + "&game_ids[]=" + temp1[9];

        Axios.get(statsUrl).then(async (response) => {
            
            // console.log(response);
            let temp = [];
            for (let i = 0; i < response.data.data.length; i++) {
                temp.push(response.data.data[i]);
            }

            let temp2 = temp.sort((a, b) => (a.game.id > b.game.id) ? -1 : 1);
            getChart(temp2);
            setLastTenPlayerStats(temp2);
        })
    }

    const getChart = (stats) => {
        let tempStats = [];
        let map = stats.map((game) => game.pts);
        let map2 = stats.map((game) => game.game.date.toString().substr(0, 10));

        console.log(map);
        console.log(map2);

        for (let i = 0; i < map.length; i++) {
            tempStats.push({date: map2[i], points: map[i]});
        }

        console.log(tempStats);

        setData({
            labels: stats.map((game) => game.game.date.toString().substr(0, 10)),
            datasets: [
                {
                    label: "Points per Game",
                    data: stats.map((game) => game.pts),
                }
            ]
        });
        
    }

    useEffect(() => {
        getStats();
        getPlayerName();
    },[])

    return (
        <div className='App-header' style={{minHeight: "0"}}>
            <h3>{name} Season Averages: </h3>

            <table className='seasonAverages'>
                <tbody>
                    <tr className='headerRow'>
                        {/* <th>Statistic</th> */}
                        <th className='stat'>Points</th>
                        <th className='stat'>Assists</th>
                        <th className='stat'>Rebounds</th>
                        <th className='stat'>3s Per Game</th>
                    </tr>
                    <tr>
                        <td className='stat'>{points}</td>
                        <td className='stat'>{assists}</td>
                        <td className='stat'>{rebounds}</td>
                        <td className='stat'>{threes}</td>
                    </tr>
                </tbody>
            </table>

            <h3>{name} Last 10 Games (Played):</h3>

            <table className='lastTen'>
                <tbody>

                    <tr className='headerRow'>

                        <th>Date</th>
                        <th>Points</th>
                        <th>Assists</th>
                        <th>Rebounds</th>
                        <th>3s Made</th>

                    </tr>

                    {lastTenPlayerStats.map((game) => {
                        return <tr className='lastTenRow' key={game.game.id}>
                            <td className='lastTenRow'>{game.game.date.toString().substr(0, 10)}</td>
                            <td className='lastTenRow'>{game.pts}</td>
                            <td className='lastTenRow'>{game.ast}</td>
                            <td className='lastTenRow'>{game.reb}</td>
                            <td className='lastTenRow'>{game.fg3m}</td>
                        </tr>
                    })}

                </tbody>
            </table>

            <div className='chart'>
                    <Bar options={options} data={data}/>
            </div>

        </div>
    )

}

export default Stats;