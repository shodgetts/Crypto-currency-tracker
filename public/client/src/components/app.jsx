import React from 'react';
import { Line } from 'react-chartjs-2';
const moment = require('moment');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Call function to check cache to see if todays data is stored
  componentDidMount() {
    this.checkCache()
  }

  // Check the Redis cache for data from today
  checkCache() {
    console.log('checking the cache for data')
    // Format a numerical date in format "mmddyyyy"
    const date = moment().format('L')
      .split("")
      .filter((n) => n !== '/' )
      .join("")
    // Save date to state so it can be used elsewhere
    this.setState({ date })

    // Make the call to the server to check if the data is there
    fetch(`http://localhost:3001/cryptoData/${date}`)
      .then((response) => response.json())
      // If data exists, save it to state
      .then((data) => this.setState({ bpiData: data.data }))
      // Call format data to render to chart
      .then(() => this.formatData())

      // If the server sends a 404 (data not found) then we need fresh data
      .catch(() => this.fetchFreshData())
  }

  // Send data to cache to be recalled later
  sendToCache() {
    console.log('sending data to cache')
    const { date } = this.state;
    // Send a POST request to the server with the data from the Coindesk call
    fetch(`http://localhost:3001/cryptoData/${date}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.bpiData)
    })
  }

  // If the server sent a 404, then request new data from Coindesk
  fetchFreshData() {
    console.log('fetching fresh data')
    fetch('https://api.coindesk.com/v1/bpi/historical/close.json')
    .then((results) => results.json())
    .then((results) => this.setState({ bpiData: results.bpi }))
    // Format the data to be ready for chart
    .then(() => this.formatData());
  }

  // Format the data saved to the state to be rendered to the chart
  formatData() {
    console.log('formatting data')
    const { bpiData } = this.state;
    const unformattedPrice = Object.values(bpiData)
    const price = unformattedPrice.map((entry) => Math.round(entry))
    const dates = Object.keys(bpiData)
    this.setState({ price, dates })
    
    // Send formatted data back to the server for storage
    this.sendToCache()
  }

  render() {
    // Format data object to pass to Line Chart
    const data = {
      labels: this.state.dates,
      datasets: [
        {
          label: 'Price ($)',
          borderColor: '#DDEDFE',
          borderWidth: 5,
          hoverBorderColor: '#DDEDFE',
          data: this.state.price,
          pointRadius: 3,
          fill: false,
        }
      ],
    };
    // Formatting options for Line Chart
    const options = {
      responsive: true,
      legend: {
        display: false,
      },
      scales: {
        yAxes: [{
          ticks: {
            display: true,
          },
          scaleLabel: {
            display: true,
            labelString: 'Price ($)',
          },
        }],
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },
      },
      tooltips: {
        mode: 'x-axis',
        titleFontSize: 20,
        bodyFontSize: 18,
        bodySpacing: 4,
      },
    };
    return (
      <div>
        <div>
          <Line 
            options={options}
            data={data}
          />
        </div>
        <div>"Powered by CoinDesk"</div>
      </div>
    )
  }
}

export default App;
