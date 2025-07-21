// src/GameState.ts
import { Property } from '../consts';

export interface WonProperties extends Property {
    winningBid: number;
    winningBidder: string;
}

// shared game state to leverage inheritance between players and the Game
export abstract class GameState {
  availableLots: Property[] = [];
  soldLots: WonProperties[] = [];
}