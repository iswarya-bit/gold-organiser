package com.iswarya.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

import com.iswarya.backend.entity.enums.UserStatus;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @OneToMany(
        mappedBy = "user",
        fetch = FetchType.LAZY
    )
    private List<Loan> loans;

}
