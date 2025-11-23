# TaldoBurger
[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![Build](https://img.shields.io/badge/Build-Maven-C71A36?logo=apache-maven)](https://maven.apache.org/)
[![Banco](https://img.shields.io/badge/DB-H2-informational)](https://www.h2database.com/)

## Descrição
Aplicação web para gerenciamento de cardápio, usuários e pedidos de uma hamburgueria. O backend expõe uma API REST em Spring Boot com persistência em memória via H2. O frontend é servido como páginas estáticas (HTML/CSS/JS) diretamente pelo Spring Boot e inclui páginas como `index`, `cardápio`, `carrinho`, `customização` e `resumo`.

- Principais funcionalidades:
  - CRUD de lanches com upload de imagem e estoque
  - Cadastro, listagem, atualização e remoção de usuários
  - Criação de pedidos com retorno de confirmação
  - Páginas estáticas de navegação e compra

- Tecnologias utilizadas:
  - Backend: Java 21, Spring Boot 3.5.5, Spring Web, Spring Data JPA, Spring Security
  - Banco: H2 (in-memory)
  - Frontend: HTML, CSS, JavaScript (estático)
  - Build: Maven (com `mvnw/mvnw.cmd`)

## Pré-requisitos
- Java 21
  - Verifique com: `java -version`
- Maven 3.9+ (ou use o Maven Wrapper incluído: `mvnw`/`mvnw.cmd`)
  - Verifique com: `mvn -v`
- Git (para clonagem do repositório)
- IDE opcional: IntelliJ IDEA, Eclipse ou VS Code

## Instalação
1. Clone o projeto:
   ```bash
   git clone https://seu-repositorio.git
   cd taldoburger

2. Execute com Maven Wrapper (recomendado):
  - Windows:
     ```bash
     mvnw.cmd spring-boot:run
  - Linux/macOS:
    ```bash
    ./mvnw spring-boot:run
    
3. Build do pacote (opcional):

- Windows:
  ```
  mvnw.cmd clean package
  ```
- Linux/macOS:
  ```
  ./mvnw clean package
  ```

4. Sobre npm install:
 - Não aplicável; o frontend é servido como arquivos estáticos e não requer Node/npm.

## Uso
- Aplicação:

  - Acesse: http://localhost:8080/
  - Páginas: index.html , cardapio.html , carrinho.html , customizacao.html , resumo.html
- Console H2:
  - URL: http://localhost:8080/h2-console
  - JDBC URL: jdbc:h2:mem:testdb
  - Usuário: sa
  - Senha: password
- Endpoints principais (exemplos com curl ):
  - Listar lanches:
  ```
  curl -s http://localhost:8080/lanches
  ```
  - Criar lanche (multipart com imagem):
  ```
  curl -X POST http://localhost:8080/lanches \
  -F "file=@src/main/resources/static/img/taldo_bacon.png" \
  -F "nome=Taldo Bacon" \
  -F "descricao=Delicioso burger com bacon crocante" \
  -F "preco=18.90" \
  -F "estoque=30"
  ```
  - - Obter lanche por ID:
  
  ```
  curl -s http://localhost:8080/lanches/1
  ```
- Atualizar lanche (com imagem opcional):
  
  ```
  curl -X PUT http://localhost:8080/lanches/1 \
    -F "file=@src/main/resources/static/img/
    taldo_cheddar.png" \
    -F "nome=Taldo Cheddar" \
    -F "descricao=Cheddar cremoso" \
    -F "preco=16.90" \
    -F "estoque=35"
  ```
- Remover lanche:
  
  ```
  curl -X DELETE http://localhost:8080/lanches/1
  ```
- Registrar usuário:
  
  ```
  curl -X POST http://localhost:8080/users/
  registro \
    -H "Content-Type: application/json" \
    -d '{
      "name":"João da Silva",
      "username":"joaosilva",
      "email":"joao@example.com",
      "password":"123456"
    }'
  ```
- Login de usuário:
  
  ```
  curl -X POST http://localhost:8080/users/login \
    -H "Content-Type: application/json" \
    -d '{"username":"joaosilva",
    "password":"123456"}'
  ```
- Listar usuários:
  
  ```
  curl -s http://localhost:8080/users
  ```
- Criar pedido:
  
  ```
  curl -X POST http://localhost:8080/orders/create 
  \
    -H "Content-Type: application/json" \
    -d '{
      "items":[{"lancheId":1,"qty":2}],
      "total":37.80,
      "customer":{"name":"João"}
    }'
  ```
- Testes:

  - Windows:
  ```
  mvnw.cmd test
  ```
  - Linux/macOS:
  ```
  ./mvnw test
  ```  


  

    

   
