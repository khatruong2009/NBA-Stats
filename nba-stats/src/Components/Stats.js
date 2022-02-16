import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import '../App.css';
import { useLocation } from "react-router-dom";

function Stats(props) {

    // const location = useLocation();
    // const {player} = location.state.player;

    return (
        <div className='App-header' style={{minHeight: "0"}}>
            <h1>Stats for: {props.player}</h1>
        </div>
    )

}

export default Stats;