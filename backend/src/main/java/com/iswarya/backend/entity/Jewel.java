package com.iswarya.backend.entity;

import java.math.BigDecimal;

import com.iswarya.backend.entity.enums.JewelType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "jewels")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Jewel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private JewelType jewelType;

    private BigDecimal weight;

    private Integer quantity;

    private String description;

    @ManyToOne
    @JoinColumn(name = "loan_id")
    private Loan loan;
}