package br.com.taldoburger.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table (name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;    
    private String username; 
    private String email;
    private String password;

    private UserRole role;

    public enum UserRole {
        USER,
        ADMIN
    }
}
