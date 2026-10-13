# Huevos-ChiquiTicos

What is this project about?:
This project is about a quail administration system.

---

## Arquitecture

    api/
        api.ts ->
    server/
        db/
            client.ts -> Create a Pool with neon and create the drizzle client.
            schema.ts -> Drizzle schema.
        middlewares/
        repositories/
        routes/
        domain/
            types/
            ports/
        app.ts
        index.ts
    src/
        config/
            container.ts -> Document to create services in functions base on VITE_DATA_SOURCE = dev (local services)/production (http services) and export it to use it in hooks.
            env.ts -> Document to charge .env variables and export it.
        features/
            module_name/
                components/
                hooks/
                    useModule_name.ts -> Hook to import services
                services/
                    module_name.local.service.ts -> Service to work in localstorage without do http requests.
                    module_name.http.service.ts -> Service to work with API http request.
                page/
                    module_name.tsx -> Feature's page.
                validations/
                    module_name.validator.ts -> Document to validate object with a schema (ZOD).
                domain/
                    module_name.d.ts -> Module domain to define object and types structure.
                    module_name.ports.ts -> Module ports to define interfaces to work with dependency injection.
        shared/
            components/ -> Global components
            hooks/ -> Global hooks
            utils/ -> Global utils
            domain/ -> Global types and ports

---

## Technologies

### CLIENT

1. React
2. TailwindCSS
3. React Query (TanStack)
4. React Router Dom
5. Zod
6. Clerk (Authentication)

### SERVER

1. Express
2. Drizzle
3. Clerk (Authentication) (Middleware)

### DATABASE

1. Neon (PostgreSQL)

---

## GIT

Use conventional commits and add a short description in every commit explaining the changes.

---

## Deploy

- CLIENT: Vercel
- SERVER: Vercel serverless functions. We'll create an express little server (inside folder server/... ) and use drizzle to manage our database. When we create server we have to use .ts in files but inport them with .js extension because vercel throw an error.
- DATABASE: Neon (PostgresSQL)
- PWA: This app will be manage also in moviles, so add the configurations that allow it be a PWA app. Generete the logo when I say you.

We have to connect this project with vercel SDK, to run it like production but in my machine, so also add it.

## .envs

Create 2 files (Vite standard names)

1. .env.local
2. .env.production

In both you have to add the .env variables that we need in both enviroments. Remember Vite only exposes variables prefixed with `VITE_` to the client.

## Design

### Colors

1. #946d44 (Secondary)
2. #faeed6 (Primary)
3. #2e1405 (Third)

- Use a profesional design based on minimalistic.
- Every modal has to be "Bottom sheet" style with a open/close animation.
- Don't use html native selects. Instead create a new custom dropdown.
- Don't use html native date picker. Instead use this one and adapt it with our color:
  C:\Users\DevDani\Desktop\Proyectos terminados\TERMINADO Eduard Finanzas\src\components\DatePicker.tsx
- Create skeleton components to show while requesting data.

## Language

- Code: English
- UI: Spanish

---

If you charge this file correctly say "I'm ready Daniel"

---
