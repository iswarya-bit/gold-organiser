package com.iswarya.backend.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    @Builder.Default
    @OneToMany(mappedBy = "jewel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<JewelImage> images = new ArrayList<>();
}