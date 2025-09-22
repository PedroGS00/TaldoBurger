package br.com.taldoburger.service;

import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.repository.LancheRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class LancheService {

    @Autowired
    private LancheRepository lancheRepository;

    public Lanche saveLanche(Lanche lanche) {
        return lancheRepository.save(lanche);
    }

    public List<Lanche> findAllLanches() {
        return lancheRepository.findAll();
    }

    public Optional<Lanche> findLancheById(Long id) {
        return lancheRepository.findById(id);
    }

    public void deleteLanche(Long id) {
        lancheRepository.deleteById(id);
    }


}
