import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { MongoClient } from 'mongodb';

interface CodeChange {
  roomId: string;
  code: string;
}

export class WebSocketServer {
  private io: SocketServer;
  private mongoClient: MongoClient;
  private db: any;

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    this.setupMongoDB();
    this.setupWebSocketHandlers();
  }

  private async setupMongoDB() {
    await this.mongoClient.connect();
    this.db = this.mongoClient.db('replit-clone');
  }

  private setupWebSocketHandlers() {
    this.io.on('connection', (socket) => {
      const { roomId, userId } = socket.handshake.query;

      // Join room
      socket.join(roomId as string);

      // Handle code changes
      socket.on('code-change', async (data: CodeChange) => {
        // Broadcast to all clients in the room except sender
        socket.to(data.roomId).emit('code-change', data.code);

        // Store in MongoDB
        await this.db.collection('files').updateOne(
          { roomId: data.roomId },
          { $set: { content: data.code, lastModified: new Date() } },
          { upsert: true }
        );
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        socket.leave(roomId as string);
      });
    });
  }

  public async close() {
    await this.mongoClient.close();
    this.io.close();
  }
} 