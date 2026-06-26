package com.iswarya.backend.dto;

import java.math.BigDecimal;

import com.iswarya.backend.entity.enums.JewelType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJewelRequest {

    private JewelType jewelType;

    private BigDecimal weight;

    private Integer quantity;

    private String description;
}