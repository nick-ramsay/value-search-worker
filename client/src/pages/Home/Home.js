import React, { useState/*, useEffect*/ } from 'react';
import SharedFunctions, { useInput } from "../../sharedFunctions/sharedFunctions";
import API from "../../utils/API";
import "./style.css";

const Home = () => {
    let [stockSymbol, setStockSymbol] = useInput("");
    let [stockData, setStockData] = useState({});
    let [stockDataArray, setStockDataArray] = useState([]);
    let currentAppendedRow = 0;

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

    let currentStockDataRow;

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
                                <table className="stock-data-table">
                                    <tbody id="stock-data-table-body">
                                        {stockDataArray.map((item, itemIndex) => {
                                            let tableBodyDiv = document.getElementById("stock-data-table-body");
                                            if (itemIndex % 3 === 0) {
                                                currentAppendedRow +=1;
                                                let newRow = document.createElement("tr");
                                                newRow.setAttribute("id","stock-data-row" + currentAppendedRow);
                                                tableBodyDiv.appendChild(newRow);
                                            }
                                            
                                            let newCell1 = document.createElement("td");
                                            newCell1.setAttribute("id","stock-title-cell" + itemIndex);
                                            newCell1.setAttribute("class","stock-data-title-column");
                                            newCell1.innerText = item[0];
                                            document.getElementById("stock-data-row" + currentAppendedRow).appendChild(newCell1);

                                            let newCell2 = document.createElement("td");
                                            newCell2.setAttribute("id","stock-data-cell" + itemIndex);
                                            newCell2.setAttribute("class","stock-data-column");
                                            newCell2.innerText = item[1];
                                            document.getElementById("stock-data-row" + currentAppendedRow).appendChild(newCell2)

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