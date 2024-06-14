#!/usr/bin/env python
try:
    # For Python 3.0 and later
    from urllib.request import urlopen
except ImportError:
    # Fall back to Python 2's urllib2
    from urllib2 import urlopen

import os
import certifi
import json
from dotenv import load_dotenv

load_dotenv()
apikey = os.environ.get("FMP_API_KEY")


def get_jsonparsed_data(url):
    response = urlopen(url, cafile=certifi.where())
    data = response.read().decode("utf-8")
    return json.loads(data)

url = ("https://financialmodelingprep.com/api/v3/stock/list?apikey=" + apikey)
print(get_jsonparsed_data(url))
