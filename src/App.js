import React from 'react'

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Create from './components/Create/Create';
import Join from './components/Join/Join';
import Play from './components/Play/Play';

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Join} />
      <Route path="/join" exact component={Join} />
      <Route path="/create" exact component={Create} />
      <Route path="/play" exact component={Play} />
    </Router>
  )
}

export default App;