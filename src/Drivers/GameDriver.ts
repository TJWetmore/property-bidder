import { PROPERTIES, Property } from '../consts';
import { GameState, WonProperties } from './GameState';
import { Player, RandomBidder, HistoryBidder, StrategicPauser, LivePlayer } from './PlayerDriver';

export class GameDriver extends GameState {
  livePlayer: LivePlayer;
  randomBidder: Player;
  historyBidder: Player;
  strategicPauser: Player;

  constructor(){
    super();
    this.availableLots = [...PROPERTIES];
    this.soldLots = [];
    this.livePlayer = new LivePlayer();
    this.randomBidder = new RandomBidder();
    this.historyBidder = new HistoryBidder();
    this.strategicPauser = new StrategicPauser();
        
    // Sync game state with all players so they can see sold lots
    this.syncGameStateToPlayers();
  }

  private syncGameStateToPlayers(): void {
    // Give all players access to the current game state
    this.livePlayer.soldLots = this.soldLots;
    this.randomBidder.soldLots = this.soldLots;
    this.historyBidder.soldLots = this.soldLots;
    this.strategicPauser.soldLots = this.soldLots;
  }

  restartGame(): void {
    this.availableLots = [...PROPERTIES];
    this.soldLots = [];
    this.livePlayer = new LivePlayer();
    this.randomBidder = new RandomBidder();
    this.historyBidder = new HistoryBidder();
    this.strategicPauser = new StrategicPauser();
    this.syncGameStateToPlayers();
  }

  determineWinner({ livePlayerBid } : { livePlayerBid: number }): { winner: string; winningBid: number; property: Property } | null {
    if (this.availableLots.length === 0) {
      throw new Error('No properties available for auction');
    }

    const currentProperty = this.availableLots[0];

    // Sync latest state before getting bids
    this.syncGameStateToPlayers();

    const livePlayerBidAmount = this.livePlayer.playerBid({ bid: livePlayerBid });
    const randomBidderAmount = this.randomBidder.bidOnProperty();
    const historyBidderAmount = this.historyBidder.bidOnProperty();
    const strategicPauserAmount = this.strategicPauser.bidOnProperty();

    const bidders = [
      { player: this.livePlayer, bid: livePlayerBidAmount, name: 'Live Player' },
      { player: this.randomBidder, bid: randomBidderAmount, name: 'Random Bidder' },
      { player: this.historyBidder, bid: historyBidderAmount, name: 'Fomo Bidder' },
      { player: this.strategicPauser, bid: strategicPauserAmount, name: 'Strategic Pauser' }
    ];

    const validBidders = bidders.filter(bidder => 
      bidder.bid > 0 && 
            bidder.bid <= bidder.player.centsRemaining
    );

    if (validBidders.length === 0) {
      this.availableLots.shift();
      return null;
    }

    const winner = validBidders.reduce((highest, current) => 
      current.bid > highest.bid ? current : highest
    );

    winner.player.isWinner({
      bidAmount: winner.bid,
      winningProperty: currentProperty
    });

    const soldProperty: WonProperties = {
      ...currentProperty,
      winningBid: winner.bid,
      winningBidder: winner.name,
    };
    this.soldLots.push(soldProperty);
    this.availableLots.shift();

    // Sync updated state after the sale
    this.syncGameStateToPlayers();

    return {
      winner: winner.name,
      winningBid: winner.bid,
      property: currentProperty
    };
  }

  isGameOver(): boolean {
    return this.availableLots.length === 0;
  }

  getCurrentProperty(): Property | null {
    return this.availableLots.length > 0 ? this.availableLots[0] : null;
  }

  getGameStatus() {
    return {
      propertiesRemaining: this.availableLots.length,
      propertiesSold: this.soldLots.length,
      livePlayerMoney: this.livePlayer.centsRemaining,
      livePlayerProperties: this.livePlayer.wonProperties.length
    };
  }
}