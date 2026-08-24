package com.iswarya.backend.exception;

public class JewelNotFoundException
        extends RuntimeException {

    public JewelNotFoundException(String message) {
        super(message);
    }
}