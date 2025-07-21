import express, { Request, Response } from 'express';
import cors from 'cors';
import { GameDriver } from './Drivers/GameDriver';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let gameDriver: GameDriver | null = null;

app.post('/api/auction/start', (req: Request, res: Response): void => {
    gameDriver = new GameDriver();
    res.json({
        success: true,
        gameStatus: gameDriver.getGameStatus(),
        currentProperty: gameDriver.getCurrentProperty()
    });
    return;
});

app.post('/api/auction/bid', (req: Request, res: Response): void => {
    if (!gameDriver) {
        res.status(400).json({ success: false, message: 'No active auction' });
        return;
    }

    const { bid } = req.body;
    if (typeof bid !== 'number' || bid < 0) {
        res.status(400).json({ success: false, message: 'Invalid bid' });
        return;
    }

    if (bid > gameDriver.livePlayer.centsRemaining) {
        res.status(400).json({ 
            success: false, 
            message: `Insufficient funds. You have ${gameDriver.livePlayer.centsRemaining} cents` 
        });
        return;
    }

    if (gameDriver.isGameOver()) {
        res.status(400).json({ success: false, message: 'Auction is complete' });
        return;
    }

    const result = gameDriver.determineWinner({ livePlayerBid: bid });
    res.json({
        success: true,
        result,
        gameStatus: gameDriver.getGameStatus(),
        nextProperty: gameDriver.getCurrentProperty(),
        isGameOver: gameDriver.isGameOver()
    });
    return;
});

app.get('/api/auction/status', (req: Request, res: Response): void => {
    if (!gameDriver) {
        res.status(400).json({ success: false, message: 'No active auction' });
        return;
    }

    res.json({
        success: true,
        gameStatus: gameDriver.getGameStatus(),
        currentProperty: gameDriver.getCurrentProperty(),
        isGameOver: gameDriver.isGameOver(),
        soldProperties: gameDriver.soldLots
    });
    return;
});

app.get('/api/auction/history', (req: Request, res: Response): void => {
    if (!gameDriver) {
        res.status(400).json({ success: false, message: 'No active auction' });
        return;
    }

    res.json({
        success: true,
        soldProperties: gameDriver.soldLots
    });
    return;
});

app.post('/api/auction/finalize', (req: Request, res: Response): void => {
    if (!gameDriver || !gameDriver.isGameOver()) {
        res.status(400).json({ success: false, message: 'Auction not complete' });
        return;
    }

    const results = {
        soldProperties: gameDriver.soldLots,
        players: {
            livePlayer: {
                money: gameDriver.livePlayer.centsRemaining,
                properties: gameDriver.livePlayer.wonProperties.length
            },
            randomBidder: {
                money: gameDriver.randomBidder.centsRemaining,
                properties: gameDriver.randomBidder.wonProperties.length
            },
            historyBidder: {
                money: gameDriver.historyBidder.centsRemaining,
                properties: gameDriver.historyBidder.wonProperties.length
            },
            strategicPauser: {
                money: gameDriver.strategicPauser.centsRemaining,
                properties: gameDriver.strategicPauser.wonProperties.length
            }
        }
    };

    gameDriver = null;
    res.json({ success: true, results });
    return;
});

app.get('/api/health', (req: Request, res: Response): void => {
    res.json({ status: 'ok' });
    return;
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;