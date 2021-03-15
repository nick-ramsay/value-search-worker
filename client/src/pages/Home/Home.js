import React, { /*useState, useEffect*/ } from 'react';
import logo from '../../../src/logo.svg';
import "./style.css";

const Home = () => {
    return (
        <div>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>Edit <code>src/pages/Home/Home.js</code> and save to reload.</p>
                    <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
                </header>
            </div>
        </div>
    )
}

export default Home;