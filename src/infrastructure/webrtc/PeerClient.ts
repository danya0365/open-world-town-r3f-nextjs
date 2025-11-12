import Peer, { type DataConnection, type MediaConnection } from "peerjs";

/**
 * PeerJS Client
 * Manages WebRTC connections for voice and video chat
 */
class PeerClient {
  private peer: Peer | null = null;
  private isInitialized = false;

  /**
   * Initialize PeerJS client
   */
  async initialize(userId: string): Promise<Peer> {
    if (this.peer) {
      console.warn("PeerJS already initialized");
      return this.peer;
    }

    return new Promise((resolve, reject) => {
      try {
        // Create peer with custom ID
        this.peer = new Peer(userId, {
          // Use public PeerJS server (free tier)
          // For production, consider hosting your own PeerServer
          host: "0.peerjs.com",
          port: 443,
          secure: true,
          debug: 2,
        });

        this.peer.on("open", (id) => {
          console.log("✅ PeerJS connected with ID:", id);
          this.isInitialized = true;
          resolve(this.peer!);
        });

        this.peer.on("error", (error) => {
          console.error("❌ PeerJS error:", error);
          reject(error);
        });

        this.peer.on("disconnected", () => {
          console.warn("⚠️ PeerJS disconnected");
        });

        this.peer.on("close", () => {
          console.log("🔴 PeerJS connection closed");
          this.isInitialized = false;
        });
      } catch (error) {
        console.error("❌ Failed to initialize PeerJS:", error);
        reject(error);
      }
    });
  }

  /**
   * Get current peer instance
   */
  getPeer(): Peer | null {
    return this.peer;
  }

  /**
   * Check if PeerJS is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.peer !== null;
  }

  /**
   * Call another peer with audio/video
   */
  call(
    remotePeerId: string,
    stream: MediaStream
  ): MediaConnection | null {
    if (!this.peer) {
      console.error("PeerJS not initialized");
      return null;
    }

    try {
      const call = this.peer.call(remotePeerId, stream);
      console.log(`📞 Calling peer ${remotePeerId}`);
      return call;
    } catch (error) {
      console.error(`❌ Failed to call peer ${remotePeerId}:`, error);
      return null;
    }
  }

  /**
   * Send data to another peer
   */
  sendData(remotePeerId: string, data: any): DataConnection | null {
    if (!this.peer) {
      console.error("PeerJS not initialized");
      return null;
    }

    try {
      const conn = this.peer.connect(remotePeerId);
      conn.on("open", () => {
        conn.send(data);
      });
      return conn;
    } catch (error) {
      console.error(`❌ Failed to send data to peer ${remotePeerId}:`, error);
      return null;
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
      this.isInitialized = false;
      console.log("🔴 PeerJS disconnected");
    }
  }
}

// Export singleton instance
export const peerClient = new PeerClient();
