import { useEffect, useCallback } from "react";
import { useKioskStore } from "@/store/kiosk-store";
import { TIMING } from "@/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useKioskMode");

export function useKioskMode(): void {
  const { lastActivity, updateActivity, resetSession } = useKioskStore();

  const handleUserActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  useEffect(() => {
    logger.debug("Kiosk mode initialized", {
      inactivityTimeoutMinutes: TIMING.INACTIVITY_TIMEOUT / 60000,
      checkIntervalSeconds: TIMING.INACTIVITY_CHECK_INTERVAL / 1000,
    });

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    const intervalId = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > TIMING.INACTIVITY_TIMEOUT) {
        logger.info("Inactivity timeout reached - resetting session", {
          inactiveMinutes: Math.round(inactiveTime / 60000),
        });
        resetSession();
      }
    }, TIMING.INACTIVITY_CHECK_INTERVAL);

    return () => {
      logger.debug("Kiosk mode cleanup");
      clearInterval(intervalId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [lastActivity, handleUserActivity, resetSession]);
}
