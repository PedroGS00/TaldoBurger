package br.com.taldoburger.service;

import br.com.taldoburger.model.User;
import br.com.taldoburger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        // Verifica se o username já existe
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username já existe");
        }
        
        // Verifica se o email já existe
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email já existe");
        }
        
        // Define role padrão se não especificado
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }
        
        return userRepository.save(user);
    }

    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser == null) {
            return null;
        }

        // Verifica se o novo username já existe (exceto para o próprio usuário)
        User userWithSameUsername = userRepository.findByUsername(updatedUser.getUsername());
        if (userWithSameUsername != null && !userWithSameUsername.getId().equals(id)) {
            throw new RuntimeException("Username já existe");
        }

        // Verifica se o novo email já existe (exceto para o próprio usuário)
        User userWithSameEmail = userRepository.findByEmail(updatedUser.getEmail());
        if (userWithSameEmail != null && !userWithSameEmail.getId().equals(id)) {
            throw new RuntimeException("Email já existe");
        }

        // Atualiza os campos
        existingUser.setName(updatedUser.getName());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        existingUser.setRole(updatedUser.getRole());

        return userRepository.save(existingUser);
    }

    public boolean deleteUser(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return false;
        }
        
        // Impede a exclusão do usuário root
        if ("root".equals(user.getUsername())) {
            throw new RuntimeException("Não é possível excluir o usuário root");
        }
        
        userRepository.deleteById(id);
        return true;
    }

    public User authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Usuário não encontrado: " + username);
        }

        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());

        // Este objeto é o que o Spring Security usa para autenticação
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}