import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import 'chart.js/auto';
import {Chart} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register([annotationPlugin]);

function Stats(props) {

    let [points, setPoints] = useState();
    let [assists, setAssists] = useState();
    let [rebounds, setRebounds] = useState();
    let [threes, setThrees] = useState();
    let [name, setName] = useState("");

    let [team, setTeam] = useState(0);

    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let year = today.getFullYear();

    let season = (month <= 5 ? year - 1 : year);

    let [lastTenPlayerStats, setLastTenPlayerStats] = useState([]);

    let [data, setData] = useState({
        labels: [],
        datasets: [{
            label: "Points per Game",
            data: [],
        }]
    });

    let [assistData, setAssistData] = useState({
        labels: [],
        datasets: [{
            label: "Assists per Game",
            data: [],
        }]
    });

    let [reboundData, setReboundData] = useState({
        labels: [],
        datasets: [{
            label: "Rebounds per Game",
            data: [],
        }]
    });

    let [threesData, setThreesData] = useState({
        labels: [],
        datasets: [{
            label: "3s per Game",
            data: [],
        }]
    });

    let [turnoversData, setTurnoversData] = useState({
        labels: [],
        datasets: [{
            label: "Turnovers per Game",
            data: [],
        }]
    });

    let [line, setLine] = useState(0);
    
    let [lineFraction, setLineFraction] = useState("");
    let [linePercent, setLinePercent] = useState(0);

    let [assistFraction, setAssistFraction] = useState("");
    let [assistPercent, setAssistPercent] = useState(0);

    let [reboundFraction, setReboundFraction] = useState("");
    let [reboundPercent, setReboundPercent] = useState(0);

    let [threesFraction, setThreesFraction] = useState("");
    let [threesPercent, setThreesPercent] = useState(0);

    let [turnoversFraction, setTurnoversFraction] = useState("");
    let [turnoversPercent, setTurnoversPercent] = useState(0);

    let [chartDisplayed, setChartDisplayed] = useState("points");

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {color: 'white', font: {size: '20px'}}
          },
          title: {
            display: true,
            text: 'Last 10 Games (If Played)',
            color: 'white',
            font: {size: '30px'}
          },
          annotation: {
            annotations: {
                line: {
                    type: 'line',
                    scaleID: 'y',
                    value: line,
                    borderColor: 'rgb(255, 255, 0)',
                    borderWidth: 2,
                    mode: 'horizontal',
                    drawtime: 'afterDatasetsDraw',
                    backgroundColor: 'rgb(255, 255, 0)',
                    label: {
                        font: {
                            weight: 'normal'
                        }, 
                        rotation: 'auto',
                        enabled: true,
                    }
                }
            }
          },
        },
        scales: {
            y: {
                ticks: {
                    color: '#FFFFFF'
                }
            }, 
            x: {
                ticks: {
                    color: '#FFFFFF',
                    font: {
                        // size: 15
                    }
                }
            }
        }
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

                // games = games.splice(0, 10);

                getLastTenStats(games);
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

        let statsUrl = "https://www.balldontlie.io/api/v1/stats/?player_ids[]=" + props.player;
        for (let i = 0; i < 25; i++) {
            statsUrl += "&game_ids[]=" + temp1[i];
        }

        //get the stats from the last 10 games using gameids
        // const statsUrl = "https://www.balldontlie.io/api/v1/stats/?player_ids[]=" + props.player + "&game_ids[]=" + temp1[0] + "&game_ids[]=" + temp1[1] + "&game_ids[]=" + temp1[2] + "&game_ids[]=" + temp1[3] + "&game_ids[]=" + temp1[4] + "&game_ids[]=" + temp1[5] + "&game_ids[]=" + temp1[6] + "&game_ids[]=" + temp1[7] + "&game_ids[]=" + temp1[8] + "&game_ids[]=" + temp1[9];

        Axios.get(statsUrl).then(async (response) => {
            
            let temp = [];
            for (let i = 0; i < response.data.data.length; i++) {
                temp.push(response.data.data[i]);
            }

            // sort the games by ID so that we get the newest ones first
            let temp2 = temp.sort((a, b) => (a.game.id > b.game.id) ? -1 : 1);

            // filter out the games that the player didn't play
            temp2 = temp2.filter(game => game.min !== "00");

            temp2 = temp2.slice(0, 10);

            getChart(temp2);
            setLastTenPlayerStats(temp2);
        })
    }

    //put the data into data object state so that the chart component can use it
    const getChart = (stats) => {
        let tempStats = [];
        // put all of the points into an array
        let map = stats.map((game) => game.pts);
        console.log(stats);
        //put all of the dates into an array
        let map2 = stats.map((game) => game.game.date.toString().substr(5, 5));
        let map3 = stats.map((game) => game.ast);
        let map4 = stats.map((game) => game.reb);
        let map5 = stats.map((game) => game.fg3m);
        let map6 = stats.map((game) => game.turnover);

        for (let i = 0; i < map.length; i++) {
            tempStats.push({date: map2[i], points: map[i]});
        }

        // set the colors for points
        let colors = [];
        let hitCount = 0;

        for (let i = 0; i < map.length; i++) {
            if (map[i] >= parseFloat(line)) {
                hitCount++;
                colors.push('rgb(0, 255, 34');
            } else {
                colors.push('rgb(255, 0, 0)');
            }
        }

        //set the colors for assists
        let assistColors = [];
        let assistCount = 0;
        for (let i = 0; i < map3.length; i++) {
            if (map3[i] >= parseFloat(line)) {
                assistCount++;
                assistColors.push('rgb(0, 255, 34');
            } else {
                assistColors.push('rgb(255, 0, 0)');
            }
        }

        //set the colors for rebounds
        let rebColors = [];
        let rebCount = 0;
        for (let i = 0; i < map4.length; i++) {
            if (map4[i] >= parseFloat(line)) {
                rebCount++;
                rebColors.push('rgb(0, 255, 34');
            } else {
                rebColors.push('rgb(255, 0, 0)');
            }
        }

        //set the colors for 3s made
        let threesColors = [];
        let threesCount = 0;
        for (let i = 0; i < map5.length; i++) {
            if (map5[i] >= parseFloat(line)) {
                threesCount++;
                threesColors.push('rgb(0, 255, 34');
            } else {
                threesColors.push('rgb(255, 0, 0)');
            }
        }

        //set the colors for turnovers
        let turnoversColors = [];
        let turnoversCount = 0;
        for (let i = 0; i < map6.length; i++) {
            if (map6[i] >= parseFloat(line)) {
                turnoversCount++;
                turnoversColors.push('rgb(0, 255, 34');
            } else {
                turnoversColors.push('rgb(255, 0, 0)');
            }
        }

        //set the fraction and percentage for hitting the line
        setLineFraction(hitCount + "/" + map.length);
        setLinePercent(((hitCount / map.length) * 100).toFixed(2));

        //set the fraction and percentage for hitting the line
        setAssistFraction(assistCount + "/" + map.length);
        setAssistPercent(((assistCount / map.length) * 100).toFixed(2));

        //set the fraction and percentage for hitting the line
        setReboundFraction(rebCount + "/" + map.length);
        setReboundPercent(((rebCount / map.length) * 100).toFixed(2));

        //set the fraction and percentage for hitting the line
        setThreesFraction(threesCount + "/" + map.length);
        setThreesPercent(((threesCount / map.length) * 100).toFixed(2));

        //set the fraction and percentage for hitting the line
        setTurnoversFraction(turnoversCount + "/" + map.length);
        setTurnoversPercent(((turnoversCount / map.length) * 100).toFixed(2));

        setData({
            labels: map2,
            datasets: [
                {
                    label: "Points per Game",
                    data: map,
                    backgroundColor: colors,
                }
            ]
        });

        setAssistData({
            labels: map2,
            datasets: [
                {
                    label: "Assists per Game",
                    data: map3,
                    backgroundColor: assistColors,
                }
            ]
        })

        setReboundData({
            labels: map2,
            datasets: [
                {
                    label: "Rebounds per Game",
                    data: map4,
                    backgroundColor: rebColors,
                }
            ]
        })

        setThreesData({
            labels: map2,
            datasets: [
                {
                    label: "3s per Game",
                    data: map5,
                    backgroundColor: threesColors,
                }
            ]
        })

        setTurnoversData({
            labels: map2,
            datasets: [
                {
                    label: "Turnovers per Game",
                    data: map6,
                    backgroundColor: turnoversColors,
                }
            ]
        })
        
    }

    const handleSwitcher = (e) => {
        setChartDisplayed(e.target.value);
        setLine(0);
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

            {/* <h3>{name} Last 10 Games (Played):</h3>

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
            </table> */}

            <div className='chartSwitcher'>
                <button style={{backgroundColor: chartDisplayed == "points" ? "green" : "white", color: chartDisplayed == "points" ? "white" : "black"}} onClick={handleSwitcher} value="points">Points</button>
                <button style={{backgroundColor: chartDisplayed == "assists" ? "green" : "white", color: chartDisplayed == "assists" ? "white" : "black"}} onClick={handleSwitcher} value="assists">Assists</button>
                <button style={{backgroundColor: chartDisplayed == "rebounds" ? "green" : "white", color: chartDisplayed == "rebounds" ? "white" : "black"}} onClick={handleSwitcher} value="rebounds">Rebounds</button>
                <button style={{backgroundColor: chartDisplayed == "threes" ? "green" : "white", color: chartDisplayed == "threes" ? "white" : "black"}} onClick={handleSwitcher} value="threes">3s Made</button>
                <button style={{backgroundColor: chartDisplayed == "turnovers" ? "green" : "white", color: chartDisplayed == "turnovers" ? "white" : "black"}} onClick={handleSwitcher} value="turnovers">Turnovers</button>
            </div>

            <div className='mobileSwitcher'>
                <select onChange={handleSwitcher}>
                    <option onClick={handleSwitcher} value="points">Points</option>
                    <option onClick={handleSwitcher} value="assists">Assists</option>
                    <option onClick={handleSwitcher} value="rebounds">Rebounds</option>
                    <option onClick={handleSwitcher} value="threes">3s Made</option>
                    <option onClick={handleSwitcher} value="turnovers">Turnovers</option>
                </select>
            </div>

            <div className='chart points' style={{display: chartDisplayed == "points" ? "block" : "none"}}>
                    <Bar options={options} data={data}/>
            </div>

            <div className='chart assists' style={{display: chartDisplayed == "assists" ? "block" : "none"}}>
                    <Bar options={options} data={assistData}/>
            </div>

            <div className='chart rebounds' style={{display: chartDisplayed == "rebounds" ? "block" : "none"}}>
                    <Bar options={options} data={reboundData}/>
            </div>

            <div className='chart threes' style={{display: chartDisplayed == "threes" ? "block" : "none"}}>
                    <Bar options={options} data={threesData}/>
            </div>

            <div className='chart turnovers' style={{display: chartDisplayed == "turnovers" ? "block" : "none"}}>
                    <Bar options={options} data={turnoversData}/>
            </div>

            <div className='line points' style={{display: chartDisplayed == "points" ? "block" : "none"}}>
                <p>Above the line {lineFraction} games.</p>
                <p>Hit percentage: {linePercent}%</p>
            </div>

            <div className='line assists' style={{display: chartDisplayed == "assists" ? "block" : "none"}}>
                <p>Above the line {assistFraction} games.</p>
                <p>Hit percentage: {assistPercent}%</p>
            </div>

            <div className='line rebounds' style={{display: chartDisplayed == "rebounds" ? "block" : "none"}}>
                <p>Above the line {reboundFraction} games.</p>
                <p>Hit percentage: {reboundPercent}%</p>
            </div>

            <div className='line threes' style={{display: chartDisplayed == "threes" ? "block" : "none"}}>
                <p>Above the line {threesFraction} games.</p>
                <p>Hit percentage: {threesPercent}%</p>
            </div>

            <div className='line turnovers' style={{display: chartDisplayed == "turnovers" ? "block" : "none"}}>
                <p>Above the line {turnoversFraction} games.</p>
                <p>Hit percentage: {turnoversPercent}%</p>
            </div>

            <p>Line: </p>
            <input inputMode='decimal' onKeyDown={() => {getChart(lastTenPlayerStats)}} onChange={event => {setLine(event.target.value)}}></input>
            <div className='lineButton'>
                <button type='number' onClick={() => {getChart(lastTenPlayerStats)}}>Set Line</button>
            </div>

        </div>
    )

}

export default Stats;