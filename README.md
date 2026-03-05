# 🎮 The Side Dex Battle

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

> **Projeto Final desenvolvido para o programa Programadores do Amanhã (PDA).**

🔗 **[Acesse o Simulador Online Aqui]((https://jorgenet0h.github.io/pokeAPI/))** *

---

## Sobre o Projeto

O **The Side Dex Battle** é um simulador de batalhas Pokémon 2v2 com design retrô inspirado nos jogos clássicos de Game Boy. O sistema consome dados reais da [PokéAPI](https://pokeapi.co/) para calcular matematicamente o vencedor do duelo, somando e comparando os **Base Stats** (HP, Attack, Defense, Sp. Atk, Sp. Def e Speed) de cada equipe.

Além da mecânica de batalha, o projeto foi desenvolvido focado em criar uma experiência completa de **Single Page Application (SPA)**, incluindo navegação sem recarregamento, configurações de áudio e consulta rápida à Pokédex.

---

## Principais Funcionalidades

- **⚔️ Motor de Batalha 2v2:** Sorteio aleatório de lutadores e cálculo de vitória baseado em atributos reais da API.
- **📱 Single Page Application (SPA):** Navegação instantânea entre as abas via Vanilla JavaScript.
- **🎨 UI/UX Retrô & Responsiva:** Interface "Pixel Art" adaptável para Desktop e Mobile (Mobile-First).
- **⚙️ Painel de Opções:** Controle de áudio (BGM/SFX), modo tela cheia e customização de interface.
- **♿ Acessibilidade (A11y):** HTML semântico, atributos ARIA e suporte nativo à navegação por teclado (focus-visible).

---

## Desafios Técnicos e Aprendizados

Durante o desenvolvimento deste projeto, a equipe aplicou boas práticas de mercado, destacando-se:
1. **Consumo Assíncrono de API:** Uso de `fetch` e `async/await` para buscar dados dinâmicos da PokéAPI, lidando com tratamento de erros.
2. **Arquitetura de CSS Modular:** Separação de estilos por escopo (`style.css`, `pokedex.css`, `about.css`, `opcoes.css`) para evitar conflitos de merge e facilitar a manutenção.
3. **Manipulação Avançada de DOM:** Atualização de elementos na tela em tempo real, incluindo animações de "máquina de escrever" para a caixa de diálogo.

---

## Como rodar o projeto localmente

Como o projeto é puramente Front-end (Vanilla), não é necessário instalar dependências pesadas.

1. Clone este repositório:
   ```bash
   git clone [https://github.com/jorgenet0h/pokeAPI.git](https://github.com/jorgenet0h/pokeAPI.git)


## 🤝 Equipe de Desenvolvimento (Squad)

Este projeto foi construído colaborativamente por nossa equipe. Cada membro teve um papel fundamental na entrega:

* **Jorge Assunção Neto (www.linkedin.com/in/jorge-assuncao-neto)** – Arquitetura Front-end, UI/UX Design, CSS Modular, Responsividade e Acessibilidade.
* **Ana Beatriz Carvalho (https://www.linkedin.com/in/ana-beatrizcarvalho/)** – Integração com a PokéAPI e desenvolvimento da lógica do motor de batalha (cálculo e regras 2v2).
* **André Luiz Gonçalves (https://www.linkedin.com/in/andr%C3%A9-luiz-gon%C3%A7alves-b910aa280/)** – Integração com a PokéAPI e implementação da lógica de batalha e manipulação de dados.
* **Agda Barbosa de Oliveira(https://www.linkedin.com/in/agda-barbosa-de-oliveira/)** – Desenvolvimento completo da Página Pokédex, incluindo listagem, exibição dinâmica e organização dos dados.
* **Luciano Oliveira Silva Junior(https://www.linkedin.com/in/luciano-oliveira-dev/)** – Desenvolvimento completo da Página Opções e implementação das regras e lógicas de configuração do sistema.
* **Victoria Ingrid Oliveira(https://www.linkedin.com/in/victoriaingrid-tech/)** – Desenvolvimento e design da Página Sobre, focando em estrutura, organização e experiência do usuário.
