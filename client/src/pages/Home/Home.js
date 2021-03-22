import React, { useState/*, useEffect*/ } from 'react';
import SharedFunctions, { useInput } from "../../sharedFunctions/sharedFunctions";
import "./style.css";

const Home = () => {
    let [stockSymbol, setStockSymbol] = useInput("");
    let [stockData, setStockData] = useState({});

    return (
        <div>
            <div className="App">
                <div className="container">
                    <div className="col-md-12 text-center">
                        <div className="row mb-2">
                            <input type="text" placeholder="Enter stock symbol here (example: AAPL)..." className="form-control" id="stockSymbolInput" name="stockSymbolInput" onChange={setStockSymbol} aria-describedby="stockSymbolHelp" />
                        </div>
                        <div className="row mb-2">
                            <button className="btn btn-sm btn-custom">Fetch Stock Data</button>
                        </div>

                        <div className="row">
                            {stockData !== {} && stockData !== undefined ?
                                ""
                                :
                                <p>No Stock Data</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;