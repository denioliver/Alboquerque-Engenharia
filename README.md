# Albuquerque Engenharia

Website institucional da Albuquerque Engenharia, desenvolvido para apresentar os serviços, projetos e canais de contato da empresa.

## Visão geral

O projeto oferece:

- Hero institucional com fotografia real de obra;
- Seções sobre a empresa, serviços e diferenciais;
- Portfólio agrupado por serviço/obra;
- Página individual com galeria de todas as imagens do serviço;
- Filtros por categoria;
- Menu responsivo e cabeçalho fixo;
- Links de contato por WhatsApp, e-mail e telefone;
- Repositório local preparado para futura integração com Firebase.

Os textos e dados de contato que ainda dependem de validação estão centralizados e identificados no código para facilitar a substituição.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router
- Lucide React
- CSS responsivo
- Firebase Hosting

## Requisitos

- Node.js 20 ou superior;
- npm.

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Para validar o projeto:

```bash
npm run lint
npm run build
```

## Estrutura principal

```text
src/
├── assets/
│   ├── logo/
│   └── servicosRealizados/
├── config/
│   └── siteConfig.ts
├── repositories/
│   └── projectRepository.ts
├── types/
│   └── project.ts
├── App.tsx
├── App.css
└── main.tsx
```

## Conteúdo das obras

Cada pasta em `src/assets/servicosRealizados/SITE` representa um serviço/obra. As imagens da pasta são agrupadas automaticamente no portfólio, e a primeira imagem é utilizada como capa.

Para adicionar um novo serviço:

1. Crie uma pasta dentro de `src/assets/servicosRealizados/SITE`;
2. Adicione as imagens do serviço;
3. Inclua os dados oficiais em `src/repositories/projectRepository.ts`;
4. Execute `npm run build` para validar.

## Configuração de contato

Edite `src/config/siteConfig.ts` para informar os dados oficiais:

- Número do WhatsApp em formato internacional, somente números;
- Telefone;
- E-mail;
- Instagram.

Enquanto os dados oficiais não forem preenchidos, o projeto utiliza valores demonstrativos.

## Publicação

O projeto pode ser publicado em plataformas compatíveis com aplicações Vite, como GitHub Pages, Netlify ou Vercel. O comando de produção é:

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist`.

## Deploy no Firebase Hosting

Instale e autentique a CLI do Firebase:

```bash
npm install -g firebase-tools
firebase login
```

Gere a versão de produção e publique:

```bash
npm run build
firebase deploy --only hosting
```

O arquivo `firebase.json` já está configurado para publicar `dist` e redirecionar as rotas do React Router para `index.html`.
