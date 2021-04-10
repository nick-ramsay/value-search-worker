import React, { useState/*, useEffect*/ } from 'react';
import SharedFunctions, { useInput } from "../../sharedFunctions/sharedFunctions";
import API from "../../utils/API";
import "./style.css";

const Home = () => {
    let [stockSymbol, setStockSymbol] = useInput("");
    let [stockData, setStockData] = useState({});
    let [stockDataArray, setStockDataArray] = useState([]);

    const scrapeQuoteData = (symbol) => {
        setStockData(stockData => Object({}));
        API.scrapeQuoteData(symbol).then(res => {
            console.log(res);
            setStockData(stockData => res.data);

            let tempStockDataArray = [];
            for (let key in res.data) {
                if (res.data.hasOwnProperty(key)) {
                    let value = res.data[key];
                    tempStockDataArray.push([key, value]);
                }
            };
            console.log(tempStockDataArray);
            setStockDataArray(stockDataArray => tempStockDataArray);
        });
    }

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
                        <button className="btn btn-sm btn-custom" onClick={() => scrapeQuoteData(stockSymbol)}>Fetch Stock Data</button>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12 text-center">
                        {Object.keys(stockData).length !== 0 && stockData !== undefined ?
                            <div>
                                <code>
                                    {JSON.stringify(stockData)}
                                </code>
                                <table>
                                    <tbody>
                                        {stockDataArray.map((item, itemIndex) => {
                                            return(
                                            <tr>
                                                <td>{item[0]}</td>
                                                <td>{item[1]}</td>
                                            </tr>
                                            )
                                        })
                                        }

                                </tbody>
                                </table>
                            </div>
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