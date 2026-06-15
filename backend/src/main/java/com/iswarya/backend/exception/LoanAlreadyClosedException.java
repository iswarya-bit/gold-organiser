package com.iswarya.backend.exception;

public class LoanAlreadyClosedException
        extends RuntimeException {

    public LoanAlreadyClosedException(
            String message) {

        super(message);
    }
}