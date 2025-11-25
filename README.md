# Escalonadores-Visual

## Pré Requisitos

- Angular CLI
- Node.js (versão LTS recomendada)
- Git
- API do Escalonadores executando localmente (backend em .NET)
- Sugerido o uso do visual studio code para facilidade nos processos

## Instalação dos pré requisitos

- Visual Studio Code
 - Baixe o instalador [Visual Studio Code](https://code.visualstudio.com/download)
 - Execute o instalador.

- Git
 - Download [GIT](https://git-scm.com/install/)
 - Realize a instalação

- Node.js
 - Download [Node.js](https://nodejs.org/pt)
 - Realize a instalação

- Angular CLI
 - No terminal, execute o comando "npm install -g @angular/cli"
 - Verifique a instalação com o comando "ng version"


## Passo a passo para execução localmente:
- Clone o repositório para sua máquina local usando o comando "git clone https://github.com/BryanSilva-Dev/Escalonadores-Visual"
- Abra o projeto com o visual studio code
- No terminal do vs code, na pasta do projeto, execute o comando npm install para instalar todas as dependências utilizadas
- Rode o projeto com o comando "ng serve"
- O projeto irá rodar na porta 4200, para acessar basta acessar o navegador de sua preferência e acessar https://localhost:4200
- Lembrando que para o funcionamento completo, a API escalonadores também deve estar rodando localmente
- Verifique a porta em que a API Escalonadores está rodando (o link do swagger mostra) e veja se é a mesma porta definida para ele no arquivo environment.ts deste projeto, caso esteja diferente, substitua pela porta certa no arquivo environment.ts
- Caso precise parar o projeto, basta apertar "ctrl" e "c" no terminal do vs