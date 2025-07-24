# value-search-worker

This is a set of scripts used to keep the database up-to-date on a daily basis for the Value Search UI (https://value-search.herokuapp.com).

To start the script, you can run `node orchestrator-v2.js`. To start the script using PM2 to maintain healthy memory usage, you can use the following command: `pm2 start orchestrator-v2.js --max-memory-restart 300M`.