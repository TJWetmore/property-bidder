# property-bidder

A service that handles running a once-around auction for properties. The player is one of four participants in a service that asks each participant to bid blindly once. The winning bid is awarded the property. There are 10 properties total, and each bidder starts with $1000. 

## Bot Strategies
Three bot bidders compete against the player:
- **Random Bidder** - Chaos agent that bids a random number between 0 and their remaining balance
- **FOMO Bidder** - Always bids $1 more than the last winning bid  
- **Strategic Pauser** - Only bids on alternating rounds, tends to have more dry powder towards the end

## Running

**With Docker:**
```
docker compose up
```

**Without Docker:**
```
npm run dev
```
# or
```
npm run build && npm start
```

## Testing

Import postmanCollection.json into Postman to test the API endpoints.
API Endpoints

POST /api/auction/start - Start new auction
POST /api/auction/bid - Submit bid
GET /api/auction/status - Get game status
GET /api/auction/history - View sold properties
POST /api/auction/finalize - End auction

### To-Do
UI (not implemented due to time constraints)