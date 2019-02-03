package com.github.jborza.sample;

import org.atmosphere.config.service.Disconnect;
import org.atmosphere.config.service.Heartbeat;
import org.atmosphere.config.service.ManagedService;
import org.atmosphere.config.service.Ready;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.atmosphere.cpr.Broadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;

import java.time.LocalTime;
import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.atmosphere.cpr.ApplicationConfig.MAX_INACTIVE;

@ManagedService(
        path = AtmosphereEndpoint.ENDPOINT_URL,
        atmosphereConfig = MAX_INACTIVE + "=10000"
)
public class AtmosphereEndpoint {
    private final Logger logger = LoggerFactory.getLogger(AtmosphereEndpoint.class);
    public final static String ENDPOINT_URL = "/atmo";

    private ScheduledExecutorService executorService;

    public AtmosphereEndpoint() {
        executorService = Executors.newSingleThreadScheduledExecutor();
        executorService.scheduleAtFixedRate(() -> broadcast("ping @ "+ LocalTime.now().toString()), 0, 1000, TimeUnit.MILLISECONDS);
    }

    @Inject
    @Named(ENDPOINT_URL)
    private Broadcaster broadcaster;

    @Ready
    public void onReady(final AtmosphereResource r) {
        logger.info("Browser {} connected", r.uuid());
    }

    @Disconnect
    public void onDisconnect(final AtmosphereResourceEvent event) {
        logger.info("Browser {} disconnected", event.getResource().uuid());
        logger.info("Event message = " + event.getMessage());
    }

    @Heartbeat
    public void onHeartbeat(final AtmosphereResourceEvent event) {
        logger.info("Heartbeat sent by {}", event.getResource().uuid());
    }

    public void broadcast(String message) {
        if (broadcaster == null)
            return;
        logger.info("Broadcasting {}", message);
        broadcaster.broadcast(message);
    }

}
