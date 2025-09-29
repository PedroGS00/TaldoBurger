package br.com.taldoburger.config;

import br.com.taldoburger.model.User;
import br.com.taldoburger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        User existingAdmin = userRepository.findByUsername("root");
        
        if (existingAdmin == null) {
            User adminUser = new User();
            adminUser.setName("Administrador");
            adminUser.setUsername("root");
            adminUser.setEmail("admin@taldoburger.com");
            adminUser.setPassword("admin123");
            adminUser.setRole(User.UserRole.ADMIN);
            
            userRepository.save(adminUser);
            System.out.println("Usuário admin criado: username=root, password=admin123");
        }
    }
}