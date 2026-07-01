package com.iswarya.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ErrorResponse {

    private LocalDateTime timestamp;

    private int status;

    private String message;

    private String path;

    private Map<String, String> errors;
}