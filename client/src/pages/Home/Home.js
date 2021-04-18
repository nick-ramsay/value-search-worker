import React, { useState, useEffect } from 'react';
import SharedFunctions, { useInput } from "../../sharedFunctions/sharedFunctions";
import API from "../../utils/API";
import "./style.css";

const Home = () => {
    let [stockSymbol, setStockSymbol] = useInput("");
    let [stockData, setStockData] = useState({});

    const scrapeQuoteData = (symbol) => {
        setStockData(stockData => Object({}));
        API.scrapeQuoteData(symbol).then(res => {
            console.log(res);
            setStockData(stockData => res.data);
        });
    }

    let currentStockDataRowArray = [];

    useEffect(() => {
    }, [])

    return (
        <div>
            <div className="container">
                <div className="row mb-4">
                    <div className="col-md-12">
                        <input type="text" placeholder="Enter stock symbol here (example: AAPL)..." className="form-control" id="stockSymbolInput" name="stockSymbolInput" onChange={setStockSymbol} aria-describedby="stockSymbolHelp" />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-md-12 text-center">
                        <button className="btn btn-sm btn-custom" onClick={() => scrapeQuoteData(stockSymbol)}>Fetch Stock Data</button>
                        <div class="accordion mt-2" id="accordionExample">
                            <div>
                                <a className="mt-4" style={{ fontSize: 14 }} data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    Raw Code &#x21c5;
                                </a>
                                <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                    <div className="code">
                                        <code>
                                            {JSON.stringify(stockData, null, '\t')}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-md-12 text-center">
                        {Object.keys(stockData).length !== 0 && stockData !== undefined ?
                            <div>
                                <table className="table table-sm table-borderless table-responsive stock-data-table" style={{margin:"0 auto"}}>
                                    <tbody>
                                        {Object.keys(stockData).map((keyName, i) => {
                                            currentStockDataRowArray.push(keyName);
                                            currentStockDataRowArray.push(stockData[keyName]);
                                            console.log(currentStockDataRowArray);
                                            if (i % 3 === 0 && i !== 0) {
                                                let tempStockDataRowArray = [];
                                                tempStockDataRowArray = currentStockDataRowArray;
                                                currentStockDataRowArray = [];
                                                return (
                                                    <tr>
                                                        <td className="stock-data-title-column">{tempStockDataRowArray[0]}</td>
                                                        <td className="stock-data-cell">{tempStockDataRowArray[1]}</td>
                                                        <td className="stock-data-title-column">{tempStockDataRowArray[2]}</td>
                                                        <td className="stock-data-cell">{tempStockDataRowArray[3]}</td>
                                                        <td className="stock-data-title-column">{tempStockDataRowArray[4]}</td>
                                                        <td className="stock-data-cell">{tempStockDataRowArray[5]}</td>
                                                    </tr>
                                                )
                                            };
                                            console.log("Iterator # " + i);
                                        })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            :
                            <p className="text-center"><strong>No Stock Data</strong></p>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;