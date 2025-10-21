package br.com.taldoburger.dto;

import br.com.taldoburger.model.User;

public record UserResponseDTO(
    Long id,
    String name,
    String username,
    String email,
    User.UserRole role

) {

    public UserResponseDTO(User user) {
        this(
        user.getId(), 
        user.getName(),
        user.getUsername(), 
        user.getEmail(), 
        user.getRole()
        );
    }
}
