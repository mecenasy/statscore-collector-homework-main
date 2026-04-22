# Welcome

Use this repository to complete tasks below. Each task is a base for the next one. Commit your changes to repository after every task. Provide **documentation** and **unit tests** for as many apps and components as possible. Some UML diagrams rendered with PlantUML or Mermaid would be a plus.

## Getting started

```sh
npm run docker:up
```

From now on, you are the owner of this repo - you can do whatever you want - including installing new packages, using frameworks of choice, creating libraries with Nx, editing packages config `scripts` section etc.

## Tasks 1

Modify landing page in the `frontend` app to display table with Jokes. Create as many components as necessary.

- [X] User can add Joke to the table by clicking on "Fetch Joke" button.
- [X] Jokes **MUST** be fetched in English from <https://v2.jokeapi.dev> API.
- [X] The table should have columns for category, joke or setup+delivery, and flags.
- [X] User can filter Jokes by category.
- [X] Created components should be implemented and styled with framework of choice.
- [X] The interface must remain functional and constrained to a maximum height of 600px, regardless of the number of jokes added to the list.

## Tasks 2

Modify the `gateway` and `frontend` app to automate Joke delivery by backend.

- [X] User can toggle automatic Joke delivery by clicking on new "Joke feed" button.
- [X] Jokes should be fetched by `gateway` app and delivered to `frontend` every 5s.
- [X] The fetch and delivery of each joke **MUST** be initiated by the `gateway` app.

## Tasks 3

Move away Joke fetching from the `gateway` app to new `emitter` app.

- [X] The `gateway` app acts as a proxy between `frontend` and the `emitter` app which fetches Jokes.
- [X] The `gateway` app should not directly 'ask' the `emitter` for a Joke; it should react to what the `emitter` produces.
- [X] The `emitter` and `gateway` apps should communicate using message broker of choice - preferably RabbitMQ.
- [X] Provide `docker run` command or `docker compose` file to run the broker locally.

---

## Enhancements Beyond Task Requirements

The following features were implemented as voluntary extensions exceeding the original specification.

### Configurable Polling Intervals

The `emitter` service supports dynamically configurable emission intervals. Rather than hardcoding the polling period, the interval value is parameterized via environment variables, allowing frequency tuning without rebuilding the container image. This eliminates polling hardcoding and enables independent throughput adjustment per service instance.

### Multi-Source Joke Fetching Architecture

The abstraction layer in the `emitter` service is designed following the **Strategy pattern**, enabling any joke provider to be plugged in via a dedicated adapter. The current implementation targets `v2.jokeapi.dev`, but the interface is provider-agnostic — adding a new data source (e.g. `icanhazdadjoke.com`) requires only a new strategy class with no changes to the service core.

### Microservice Containerization (Docker)

All system services — `frontend`, `gateway`, `emitter`, and the RabbitMQ message broker — are containerized and defined as discrete services within `docker-compose.yml`. Each microservice has its own isolated Docker image, ensuring reproducible builds and eliminating environment drift between developer machines and the target runtime.

### Frontend Served via Nginx

The `frontend` application is built as a static artifact and served by **Nginx** running inside a dedicated container. Using Nginx as a web server for static assets delivers high-performance file serving, `gzip` compression support, and the ability to extend the configuration with cache-control headers or TLS termination without modifying application code.
