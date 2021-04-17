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
                                <table className="table table-sm table-borderless table-responsive stock-data-table">
                                    <tbody id="stock-data-table-body">
                                        {Object.keys(stockData).map((keyName, i) => {
                                            currentStockDataRowArray.push(keyName);
                                            currentStockDataRowArray.push(stockData[keyName]);
                                            console.log(currentStockDataRowArray);
                                            if (i % 3 === 0 && i !== 0) {
                                                return(
                                                <tr>
                                                    <td>{currentStockDataRowArray[0]}</td>
                                                    <td>{currentStockDataRowArray[1]}</td>
                                                    <td>{currentStockDataRowArray[2]}</td>
                                                    <td>{currentStockDataRowArray[3]}</td>
                                                    <td>{currentStockDataRowArray[4]}</td>
                                                    <td>{currentStockDataRowArray[5]}</td>
                                                </tr>)
                                            };
                                            if (i % 3 === 0 && i !== 0) {
                                                currentStockDataRowArray = []
                                            }
                                        })

                                            /*stockDataArray.map((item, itemIndex) => {
                                                let tableBodyDiv = document.getElementById("stock-data-table-body");
                                                if (itemIndex % 2 === 0) {
                                                    currentAppendedRow += 1;
                                                    const newRow = document.createElement("tr");
                                                    newRow.setAttribute("id", "stock-data-row" + currentAppendedRow);
                                                    newRow.setAttribute("key", "stock-data-row" + currentAppendedRow);
                                                    tableBodyDiv.appendChild(newRow);
                                                }
    
                                                let newCell1 = document.createElement("td");
                                                newCell1.setAttribute("id", "stock-title-cell" + itemIndex);
                                                newCell1.setAttribute("key", "stock-title-cell" + itemIndex);
                                                newCell1.setAttribute("class", "stock-data-title-column");
                                                newCell1.innerText = item[0];
                                                document.getElementById("stock-data-row" + currentAppendedRow).appendChild(newCell1);
    
                                                let newCell2 = document.createElement("td");
                                                newCell2.setAttribute("id", "stock-data-cell" + itemIndex);
                                                newCell2.setAttribute("key", "stock-data-cell" + itemIndex);
                                                newCell2.setAttribute("class", "stock-data-column");
                                                newCell2.innerText = item[1];
                                                document.getElementById("stock-data-row" + currentAppendedRow).appendChild(newCell2)
                                            
                                            })
                                            */
                                        }
                                    </tbody>
                                </table>
                            </div>
                            :
                            <p><strong>No Stock Data</strong></p>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;