import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom';

const Create = ({ location }) => {
  const [nick, setNick] = useState('');
  const [color, setColor] = useState('white');
  const [round, setRound] = useState("2");
  const [timer, setTimer] = useState("30");
  const [language, setLanguage] = useState('Korean');

  const ROUND = new Array(9).fill(2).map((num, i) => num = num + i)
  const TIMER = new Array(16).fill(0).map((num, i) => num = 30 + (i*10))
  const LANGUAGE = ["Korean", "English"];
  
  useEffect(() => {
    const { nick, color } = queryString.parse(location.search);
    if(nick && color){
      setNick(nick);
      setColor(color);
    }
  }, [location.search])

  return (
    <div className="createContainer">
      <select id="round" onChange={(event) => setRound(event.target.value)}>
        {
          ROUND.map((item, i) => <option key={i} value={item}>{item}</option>)
        }
      </select>
      <select id="timer" onChange={(event) => setTimer(event.target.value)}>
        {
          TIMER.map((item, i) => <option key={i} value={item}>{item}</option>)
        }
      </select>
      <select id="language" onChange={(event) => setLanguage(event.target.value)}>
        {
          LANGUAGE.map((item, i) => <option key={i} value={item}>{item}</option>)
        }
      </select>
      <Link to={`/play?${rot13(`nick=${nick}&color=${color}&round=${round}&timer=${timer}&language=${language}`)}`}>
        <button>Create</button>
      </Link>
    </div>
  )
}

function rot13(str) {
  var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
  var index     = x => input.indexOf(x);
  var translate = x => index(x) > -1 ? output[index(x)] : x;
  return str.split('').map(translate).join('');
}

export default Create;