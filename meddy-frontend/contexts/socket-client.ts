export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: {
    maxRetries: number;
    retryDelay: number;
    debug?: boolean;
  };
  private retryCount = 0;
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private listeners: {
    message: ((data: any) => void)[];
    open: (() => void)[];
    close: (() => void)[];
    error: ((error: any) => void)[];
  };

  constructor(
    url: string,
    options = { maxRetries: 5, retryDelay: 3000, debug: false }
  ) {
    console.log('socket url', url);
    this.url = url;
    this.options = options;
    this.listeners = {
      message: [],
      open: [],
      close: [],
      error: [],
    };
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.bindEvents();
    } catch (error) {
      this.handleError(error);
    }
  }

  private bindEvents(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('Connected');
      this.retryCount = 0;
      this.listeners.open.forEach(listener => listener());
    };

    this.ws.onclose = () => {
      this.log('Disconnected');
      this.listeners.close.forEach(listener => listener());
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };

    this.ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.listeners.message.forEach(listener => listener(data));
      } catch (error) {
        this.handleError(error);
      }
    };
  }

  private attemptReconnect(): void {
    if (this.retryCount < this.options.maxRetries) {
      this.log(`Reconnecting... Attempt ${this.retryCount + 1}/${this.options.maxRetries}`);
      this.retryTimeoutId = setTimeout(() => {
        this.retryCount++;
        this.connect();
      }, this.options.retryDelay);
    } else {
      this.log('Max reconnection attempts reached');
    }
  }

  private handleError(error: any): void {
    this.log('Error:', error);
    this.listeners.error.forEach(listener => listener(error));
  }

  private log(...args: any[]): void {
    if (this.options.debug) {
      // console.log('[WebSocket]', ...args);
    }
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.handleError(new Error('WebSocket is not connected'));
    }
  }

  public on(event: 'message' | 'open' | 'close' | 'error', callback: any): void {
    this.listeners[event].push(callback);
  }

  public off(event: 'message' | 'open' | 'close' | 'error', callback: any): void {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  public disconnect(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.ws?.close();
  }
}