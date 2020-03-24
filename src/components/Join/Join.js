import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';

const Join = ({ location }) => {
  const [nick, setNick] = useState('');
  const [color, setColor] = useState('white');
  const [room, setRoom] = useState('random');

  useEffect(() => {
    const { hasRoom } = queryString.parse(location.search) || false;
    if(hasRoom){
      setRoom(hasRoom);
    }
  }, [location.search])
  

  return (
    <div className="joinContainer">
      <input className="nickName" placeholder="NickName" onChange={(event) => setNick(event.target.value)}></input>
      <select className="select" id="colors" onChange={(event) => setColor(event.target.value)}>
        <option value="white">white</option>
        <option value="red">red</option>
        <option value="orange">orange</option>
        <option value="yellow">yellow</option>
        <option value="green">green</option>
        <option value="blue">blue</option>
        <option value="pink">pink</option>
        <option value="indigo">indigo</option>
        <option value="black">black</option>
      </select>
      <Link onClick={event => (!nick) ? event.preventDefault() : null} to={`/play?nick=${nick}&color=${color}&room=${room}`}>
        <button className="playButton">Play</button>
      </Link>
      <Link onClick={event => (!nick) ? event.preventDefault() : null} to={`/create?nick=${nick}&color=${color}`}>
        <button className="createButton">Create Private Room</button>
      </Link>
    </div>
  )
}

export default Join;
