package com.odam;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarHash {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = encoder.encode("Admin123");

        System.out.println("HASH:");
        System.out.println(hash);

        System.out.println("COMPROBACIÓN:");
        System.out.println(encoder.matches("Admin123", hash));
    }
}