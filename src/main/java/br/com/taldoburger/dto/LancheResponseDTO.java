package br.com.taldoburger.dto;

import br.com.taldoburger.model.Lanche;

public record LancheResponseDTO(
    Long id,
    String nome,
    String descricao,
    Double preco,
    Integer estoque,
    String imagePath

) {

    public LancheResponseDTO(Lanche lanche) {
        this(
            lanche.getId(),
            lanche.getNome(),
            lanche.getDescricao(),
            lanche.getPreco(),
            lanche.getEstoque(),
            lanche.getImagePath()
        );
    }
   
}
