package com.github.jborza.sample;

import java.util.Locale;
import java.util.Random;

public class TickerJob implements Runnable {
    private final Random random;
    private final Broadcastable target;

    public TickerJob(Broadcastable target) {
        this.target = target;
        random = new Random();
    }

    @Override
    public void run() {
        try {
            double value = random.nextDouble();
            String message = String.format(Locale.ROOT, "%f", value);
            target.broadcast(message);
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }
}