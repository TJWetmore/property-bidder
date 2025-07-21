import { Property } from '../consts';
import { GameState } from './GameState';

export class Player extends GameState {
  centsRemaining: number;
  wonProperties: Property[];
    
  constructor(){
    super();
    this.centsRemaining = 100000;
    this.wonProperties = [];
  }

  bidOnProperty(): number {
    throw new Error('Method not implemented');
  }

  isWinner({bidAmount, winningProperty}: {bidAmount: number, winningProperty: Property}): void {
    this.centsRemaining -= bidAmount;
    this.wonProperties.push(winningProperty);
  }

  randomBid(): number {
    return Math.floor(Math.random() * this.centsRemaining);
  }
}

export class LivePlayer extends Player {
  playerBid({ bid } : { bid?: number }): number {
    if (bid && bid > this.centsRemaining){
      throw new Error(`Invalid bid, you have ${this.centsRemaining} cents remaining and bid ${bid} cents`);
    }
    return bid ?? 0;
  }

  bidOnProperty(): number {
    throw new Error('LivePlayer requires user input for bidding');
  }
}

// Chaos agent - random bid amounts;
export class RandomBidder extends Player {
  bidOnProperty(): number {
    return super.randomBid();
  }
}

// classic Fomo bidder - bids $1 more than the previous bid
export class HistoryBidder extends Player {
  bidOnProperty(): number {
    const lastProperty = this.soldLots[this.soldLots.length - 1];
    if (lastProperty && lastProperty.winningBid){
      return lastProperty.winningBid + 100;
    } else {
      return 100;
    }
  }
}

// takes breaks - goal is to win a lot of properties towards the end of the game 
export class StrategicPauser extends Player {
  shouldBid: boolean;

  constructor(){
    super();
    this.shouldBid = true;
  }

  bidOnProperty(): number {
    // should skip the first round;
    this.shouldBid = !this.shouldBid;
        
    if (this.shouldBid){
      return super.randomBid();
    } else {
      return 0;
    }
  }
}