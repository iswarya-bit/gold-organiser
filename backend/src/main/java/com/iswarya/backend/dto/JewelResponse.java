package com.iswarya.backend.dto;

import java.math.BigDecimal;

import com.iswarya.backend.entity.enums.JewelType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JewelResponse {

    private Long id;

    private JewelType jewelType;

    private BigDecimal weight;

    private Integer quantity;

    private String description;
}