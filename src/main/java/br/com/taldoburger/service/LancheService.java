package br.com.taldoburger.service;

import br.com.taldoburger.dto.LancheResponseDTO; 
import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.repository.LancheRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; 
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors; // Para DTOs

@Service
public class LancheService {

    @Autowired
    private LancheRepository lancheRepository;

    private final Path rootLocation = Path.of("src/main/resources/static/img");

    public LancheService(){
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar o local de armazenamento de arquivos", e);
        }
    }

    public LancheResponseDTO saveImg(MultipartFile file, String nome, String descricao, Double preco, Integer estoque) {
        try {
            String imagePath;
            
            if (file.isEmpty()) {
                throw new RuntimeException("Falha ao salvar arquivo vazio.");
            }
            
            String originalFilename = file.getOriginalFilename();
            
            // Verificar se já existe uma imagem com o mesmo nome
            Path existingFile = this.rootLocation.resolve(originalFilename);
            if (Files.exists(existingFile)) {
                // Reutilizar a imagem existente
                imagePath = originalFilename;
            } else {
                // Salvar nova imagem apenas se não existir
                Files.copy(file.getInputStream(), existingFile);
                imagePath = originalFilename;
            }

            Lanche lanche = new Lanche();
            lanche.setNome(nome);
            lanche.setDescricao(descricao);
            lanche.setPreco(preco);
            lanche.setEstoque(estoque);
            lanche.setImagePath(imagePath); 

            Lanche savedLanche = lancheRepository.save(lanche);
            
            return new LancheResponseDTO(savedLanche);

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar o arquivo.", e);
        }
    }

    public LancheResponseDTO updateLancheWithImage(Long id, MultipartFile file, String nome, String descricao, Double preco, Integer estoque) {
        Optional<Lanche> existingLanche = findLancheById(id);
        if (existingLanche.isEmpty()) {
            throw new RuntimeException("Lanche não encontrado com ID: " + id);
        }

        Lanche lanche = existingLanche.get();
        
        // Atualizar dados básicos
        lanche.setNome(nome);
        lanche.setDescricao(descricao);
        lanche.setPreco(preco);
        lanche.setEstoque(estoque);

        // Se uma nova imagem foi fornecida, salvar e atualizar o caminho
        if (file != null && !file.isEmpty()) {
            try {
                String originalFilename = file.getOriginalFilename();
                
                // Verificar se já existe uma imagem com o mesmo nome
                Path existingFile = this.rootLocation.resolve(originalFilename);
                if (Files.exists(existingFile)) {
                    // Reutilizar a imagem existente
                    lanche.setImagePath(originalFilename);
                } else {
                    // Salvar nova imagem apenas se não existir
                    Files.copy(file.getInputStream(), existingFile);
                    lanche.setImagePath(originalFilename);
                }
            } catch (IOException e) {
                throw new RuntimeException("Falha ao salvar o arquivo.", e);
            }
        }

        Lanche savedLanche = lancheRepository.save(lanche);
        return new LancheResponseDTO(savedLanche);
    }

    public Lanche saveLanche(Lanche lanche) {
        return lancheRepository.save(lanche);
    }

    public List<LancheResponseDTO> findAllLanches() {
        return lancheRepository.findAll().stream().map(LancheResponseDTO::new).collect(Collectors.toList());
    }

    public Optional<Lanche> findLancheById(Long id) {
        return lancheRepository.findById(id);
    }

    public void deleteLanche(Long id) {
        lancheRepository.deleteById(id);
    }


}
