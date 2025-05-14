// Simple example of subscribing to allmids using the HyperLiquid SDK

// Add WebSocket polyfill for Node.js (not needed in browsers or React Native)
const WebSocket = require('ws');
global.WebSocket = WebSocket;

// Polyfill AbortSignal.any if needed
if (typeof AbortSignal !== 'undefined' && !AbortSignal.any) {
  AbortSignal.any = function(signals) {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal && typeof signal.addEventListener === 'function') {
        signal.addEventListener('abort', () => controller.abort(signal.reason));
      }
    }
    return controller.signal;
  };
}

// Now import the SDK
const hl = require('../dist/index.js');

async function main() {
  try {
    console.log("Creating WebSocket transport...");
    const transport = new hl.WebSocketTransport();
    
    console.log("Creating event client...");
    const client = new hl.EventClient({ transport });
    
    console.log("Subscribing to allmids...");
    const subscription = await client.allMids({}, (data) => {
      console.log("Received allmids data:", JSON.stringify(data, null, 2));
    });
    
    console.log("Successfully subscribed. Will listen for 30 seconds...");
    
    // Keep the process alive for 30 seconds
    setTimeout(async () => {
      console.log("Unsubscribing...");
      await subscription.unsubscribe();
      console.log("Unsubscribed. Exiting...");
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Handle Ctrl+C to gracefully exit
process.on('SIGINT', () => {
  console.log("\nReceived SIGINT. Exiting...");
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
