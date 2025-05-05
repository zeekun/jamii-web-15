"use client";
import { ReactNode, useEffect, useState } from "react";

interface SingleTabEnforcerOptions {
  onDuplicate?: () => void;
  enforcementMethod?: "localStorage" | "broadcastChannel" | "sharedWorker";
  appId?: string;
  blockDuplicates?: boolean;
  redirectUrl?: string;
  heartbeatInterval?: number;
}

/**
 * A custom React hook to prevent an application from running in multiple tabs simultaneously
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onDuplicate - Function to call when a duplicate tab is detected
 * @param {string} options.enforcementMethod - Method to use ('localStorage', 'broadcastChannel', or 'sharedWorker')
 * @param {string} options.appId - Unique identifier for your application (used for storage keys and channel names)
 * @param {boolean} options.blockDuplicates - Whether to completely block duplicate tabs or just notify
 * @param {string} options.redirectUrl - URL to redirect to if duplicate is detected (when blockDuplicates is true)
 * @param {number} options.heartbeatInterval - Interval in ms for ping/heartbeat checks (for localStorage method)
 * @returns {boolean} isOriginalTab - True if this is the original tab, false if duplicate
 */
function useSingleTabEnforcer({
  onDuplicate = () => alert("This application is already open in another tab"),
  enforcementMethod = "localStorage",
  appId = "react-single-tab-app",
  blockDuplicates = true,
  redirectUrl = "/multiple-tabs-error",
  heartbeatInterval = 1000,
}: SingleTabEnforcerOptions = {}): boolean {
  const [isOriginalTab, setIsOriginalTab] = useState(true);

  useEffect(() => {
    let cleanup = () => {};
    let heartbeatTimer: NodeJS.Timeout;
    let responseTimeout: NodeJS.Timeout;

    // Implementation for localStorage method
    if (enforcementMethod === "localStorage") {
      const tabId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const storageKey = `${appId}-current-tab`;
      const heartbeatKey = `${appId}-heartbeat`;

      // Try to register this tab
      const existingTab = localStorage.getItem(storageKey);
      if (existingTab) {
        // Check if the existing tab is still active via heartbeat
        const lastHeartbeat = localStorage.getItem(heartbeatKey);
        const now = Date.now();

        if (
          lastHeartbeat &&
          now - parseInt(lastHeartbeat, 10) < heartbeatInterval * 2
        ) {
          // Existing tab is still active
          setIsOriginalTab(false);

          if (blockDuplicates) {
            onDuplicate();
            if (redirectUrl) window.location.href = redirectUrl;
            return;
          }
        } else {
          // Existing tab appears inactive, take over
          localStorage.setItem(storageKey, tabId);
          localStorage.setItem(heartbeatKey, now.toString());
        }
      } else {
        // No existing tab, register this one
        localStorage.setItem(storageKey, tabId);
        localStorage.setItem(heartbeatKey, Date.now().toString());
      }

      // Set up heartbeat to show this tab is active
      heartbeatTimer = setInterval(() => {
        if (localStorage.getItem(storageKey) === tabId) {
          localStorage.setItem(heartbeatKey, Date.now().toString());
        } else {
          // Another tab has taken control
          setIsOriginalTab(false);
          if (blockDuplicates) {
            clearInterval(heartbeatTimer);
            onDuplicate();
            if (redirectUrl) window.location.href = redirectUrl;
          }
        }
      }, heartbeatInterval);

      // Set up listener for changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === storageKey && e.newValue && e.newValue !== tabId) {
          // Another tab is trying to open
          if (isOriginalTab) {
            // Reclaim authority by writing our ID
            localStorage.setItem(storageKey, tabId);
            localStorage.setItem(heartbeatKey, Date.now().toString());
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Cleanup function
      cleanup = () => {
        clearInterval(heartbeatTimer);
        window.removeEventListener("storage", handleStorageChange);
        if (localStorage.getItem(storageKey) === tabId) {
          localStorage.removeItem(storageKey);
          localStorage.removeItem(heartbeatKey);
        }
      };
    }

    // Implementation for Broadcast Channel API
    else if (enforcementMethod === "broadcastChannel") {
      let channel: BroadcastChannel | undefined;

      try {
        channel = new BroadcastChannel(`${appId}-channel`);

        // Announce this tab is open and ask if others are open
        channel.postMessage({ type: "TAB_OPENED", timestamp: Date.now() });

        let hasReceivedResponses = false;

        // Listen for other tabs
        channel.onmessage = (event) => {
          if (event.data.type === "TAB_OPENED") {
            // If we receive a TAB_OPENED, we respond to let them know we exist
            channel?.postMessage({
              type: "TAB_ALREADY_OPEN",
              timestamp: Date.now(),
            });
          }

          if (event.data.type === "TAB_ALREADY_OPEN") {
            hasReceivedResponses = true;
            setIsOriginalTab(false);

            if (blockDuplicates) {
              onDuplicate();
              if (redirectUrl) window.location.href = redirectUrl;
            }
          }
        };

        // If no responses after a short delay, we're likely the only tab
        responseTimeout = setTimeout(() => {
          if (!hasReceivedResponses) {
            setIsOriginalTab(true);
          }
        }, 500);

        // Cleanup function
        cleanup = () => {
          clearTimeout(responseTimeout);
          channel?.close();
        };
      } catch (err) {
        console.error(
          "BroadcastChannel not supported in this browser. Falling back to localStorage"
        );
        // Fall back to localStorage method
        enforcementMethod = "localStorage";
        setIsOriginalTab(true);
        return;
      }
    }

    // Implementation for Shared Worker
    else if (enforcementMethod === "sharedWorker") {
      try {
        // Create a worker script as a blob
        const workerScript = `
          let connections = 0;
          let primaryTabId = null;
          
          self.onconnect = function(e) {
            connections++;
            const port = e.ports[0];
            const tabId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
            
            if (!primaryTabId) {
              primaryTabId = tabId;
            }
            
            port.postMessage({ 
              type: 'CONNECTION_STATUS', 
              isPrimary: tabId === primaryTabId,
              connections,
              tabId,
              primaryTabId
            });
            
            port.onmessage = function(e) {
              // Handle messages from the main app
              if (e.data.type === 'HEARTBEAT') {
                port.postMessage({ type: 'HEARTBEAT_RESPONSE' });
              }
            }
            
            port.onclose = function() {
              connections--;
              if (tabId === primaryTabId && connections > 0) {
                // Primary tab closed, need to elect new primary
                primaryTabId = null; // Will be set by next message
              }
            }
          }
        `;

        const workerBlob = new Blob([workerScript], {
          type: "application/javascript",
        });
        const workerUrl = URL.createObjectURL(workerBlob);

        const worker = new SharedWorker(workerUrl);
        worker.port.start();

        // Handle messages from the worker
        worker.port.onmessage = (e) => {
          if (e.data.type === "CONNECTION_STATUS") {
            const isPrimary = e.data.isPrimary;
            const connections = e.data.connections;

            setIsOriginalTab(isPrimary);

            if (!isPrimary && connections > 1 && blockDuplicates) {
              onDuplicate();
              if (redirectUrl) window.location.href = redirectUrl;
            }
          }
        };

        // Set up heartbeat to keep connection alive
        heartbeatTimer = setInterval(() => {
          worker.port.postMessage({ type: "HEARTBEAT" });
        }, heartbeatInterval);

        // Cleanup function
        cleanup = () => {
          clearInterval(heartbeatTimer);
          worker.port.close();
          URL.revokeObjectURL(workerUrl);
        };
      } catch (err) {
        console.error(
          "SharedWorker not supported in this browser. Falling back to localStorage"
        );
        // Fall back to localStorage method
        enforcementMethod = "localStorage";
        setIsOriginalTab(true);
        return;
      }
    }

    // Clean up on component unmount
    return cleanup;
  }, [
    onDuplicate,
    enforcementMethod,
    appId,
    blockDuplicates,
    redirectUrl,
    heartbeatInterval,
    isOriginalTab,
  ]);

  return isOriginalTab;
}

export default function SingleTabGuard({ children }: { children: ReactNode }) {
  useSingleTabEnforcer();
  return <>{children}</>;
}
