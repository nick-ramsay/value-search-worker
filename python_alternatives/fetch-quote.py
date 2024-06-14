import os
from dotenv import load_dotenv
import typing
import fmpsdk

# Actual API key is stored in a .env file.  Not good to store API key directly in script.
load_dotenv()
apikey = os.environ.get("FMP_API_KEY")

# Company Valuation Methods
symbol: str = "AAPL"
print(f"Company Profile: {fmpsdk.quote(apikey=apikey, symbol=symbol)}")