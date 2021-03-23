import React, { useState/*, useEffect*/ } from 'react';
import SharedFunctions, { useInput } from "../../sharedFunctions/sharedFunctions";
import "./style.css";

const Home = () => {
    let [stockSymbol, setStockSymbol] = useInput("");
    let [stockData, setStockData] = useState({});

    return (
        <div>
            <div className="container">
                <div className="row mb-4">
                    <div className="col-md-12 text-center">
                        <input type="text" placeholder="Enter stock symbol here (example: AAPL)..." className="form-control" id="stockSymbolInput" name="stockSymbolInput" onChange={setStockSymbol} aria-describedby="stockSymbolHelp" />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-md-12 text-center">
                        <button className="btn btn-sm btn-custom">Fetch Stock Data</button>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12 text-center">
                        {Object.keys(stockData).length !== 0 && stockData !== undefined ?
                            ""
                            :
                            <p>No Stock Data</p>

                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;