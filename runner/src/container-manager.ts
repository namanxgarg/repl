import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';

export class ContainerManager {
  private docker: Docker;
  private containerCache: Map<string, any>;
  private readonly MAX_CONTAINERS = 1000;
  private readonly CONTAINER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.docker = new Docker();
    this.containerCache = new Map();
    this.cleanupInactiveContainers();
  }

  private async cleanupInactiveContainers() {
    setInterval(async () => {
      const now = Date.now();
      for (const [id, container] of this.containerCache.entries()) {
        if (now - container.lastUsed > this.CONTAINER_TIMEOUT) {
          await this.removeContainer(id);
        }
      }
    }, 60000); // Check every minute
  }

  async createContainer(): Promise<string> {
    if (this.containerCache.size >= this.MAX_CONTAINERS) {
      throw new Error('Maximum container limit reached');
    }

    const containerId = uuidv4();
    const container = await this.docker.createContainer({
      Image: 'replit-clone-base:latest',
      name: `replit-${containerId}`,
      HostConfig: {
        Memory: 512 * 1024 * 1024, // 512MB
        CPUPeriod: 100000,
        CPUQuota: 50000, // 50% CPU
        SecurityOpt: ['no-new-privileges'],
        ReadonlyRootfs: true,
        Binds: ['/tmp:/tmp:rw'],
      },
      Tty: true,
      OpenStdin: true,
    });

    await container.start();
    this.containerCache.set(containerId, {
      container,
      lastUsed: Date.now(),
    });

    return containerId;
  }

  async executeCode(containerId: string, code: string): Promise<string> {
    const containerData = this.containerCache.get(containerId);
    if (!containerData) {
      throw new Error('Container not found');
    }

    containerData.lastUsed = Date.now();
    const exec = await containerData.container.exec({
      Cmd: ['node', '-e', code],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start();
    let output = '';
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        output += chunk.toString();
      });
      
      stream.on('end', () => {
        resolve(output);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async removeContainer(containerId: string): Promise<void> {
    const containerData = this.containerCache.get(containerId);
    if (containerData) {
      await containerData.container.stop();
      await containerData.container.remove();
      this.containerCache.delete(containerId);
    }
  }
} 