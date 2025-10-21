package br.com.taldoburger.dto;

public record UserRequestDTO(
        String name,
        String username,
        String email,
        String password
) {
}
