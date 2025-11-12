import { Room, Client } from "@colyseus/core";
import { GameState, Player } from "./schema/GameState";

export class GameRoom extends Room<GameState> {
  maxClients = 50; // Maximum players per room
  state = new GameState();
  private updateInterval?: NodeJS.Timeout;

  onCreate(options: any) {
    console.log("🎮 GameRoom created!", options);

    // Set up message handlers
    this.onMessage("move", (client, message) => {
      this.handlePlayerMove(client, message);
    });

    this.onMessage("chat", (client, message) => {
      this.broadcast(
        "chat",
        {
          playerId: client.sessionId,
          message: message.text,
          timestamp: Date.now(),
        },
        { except: client }
      );
    });

    // Game loop - Update state every 16ms (~60 FPS)
    this.updateInterval = setInterval(() => {
      this.updateGameState();
    }, 1000 / 60);

    console.log("✅ GameRoom initialized with update loop at 60 FPS");
  }

  onJoin(client: Client, options: any) {
    console.log(`👤 Player ${client.sessionId} joined!`);

    // Create new player
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.username || `Player${this.clients.length}`;
    
    // Random spawn position (-5 to 5)
    player.x = Math.random() * 10 - 5;
    player.y = 0;
    player.z = Math.random() * 10 - 5;
    player.rotation = 0;
    player.timestamp = Date.now();

    // Add player to state
    this.state.players.set(client.sessionId, player);

    // Broadcast join message to other players
    this.broadcast(
      "player_joined",
      {
        playerId: client.sessionId,
        username: player.username,
      },
      { except: client }
    );

    console.log(`✅ Player "${player.username}" spawned at (${player.x.toFixed(2)}, ${player.z.toFixed(2)})`);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`👋 Player ${client.sessionId} left (consented: ${consented})`);

    const player = this.state.players.get(client.sessionId);

    if (player) {
      // Broadcast leave message
      this.broadcast("player_left", {
        playerId: client.sessionId,
        username: player.username,
      });

      // Remove player from state
      this.state.players.delete(client.sessionId);
      console.log(`🗑️  Removed player "${player.username}" from game`);
    }
  }

  onDispose() {
    console.log("🔴 GameRoom", this.roomId, "disposing...");

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  /**
   * Handle player movement updates
   */
  private handlePlayerMove(client: Client, message: any) {
    const player = this.state.players.get(client.sessionId);

    if (player && message) {
      player.x = message.x ?? player.x;
      player.y = message.y ?? player.y;
      player.z = message.z ?? player.z;
      player.rotation = message.rotation ?? player.rotation;
      player.isMoving = message.isMoving ?? false;
      player.timestamp = Date.now();
    }
  }

  /**
   * Update game state (60 FPS)
   */
  private updateGameState() {
    // Update server timestamp
    this.state.serverTime = Date.now();

    // Future: Add NPC movement, physics, etc.
  }
}
