package br.com.taldoburger.service;

import br.com.taldoburger.model.User;
import br.com.taldoburger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser (User user) {
        if (user == null || user.getPassword() == null || user.getPassword().isEmpty()) {
            return null;
        }
        return userRepository.save(user);
    }

    public User loginUser (String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}
