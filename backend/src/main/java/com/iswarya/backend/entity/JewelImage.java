package com.iswarya.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "jewel_images")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JewelImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jewel_id", nullable = false)
    private Jewel jewel;
}