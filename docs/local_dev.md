# Getting Started

Assuming you have created a new repo based on this template, this guide focuses on how to get started developing your leaflet app.

# Pre-requisitis

* [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Use nvm to install npm 

`nvm install 20`

... or whatever version you want to run.

Load Dependencies

`npm install`

# Running the starter app

```
cd frontend
npm run dev
```

Should set things up allowing for local development.  The npm served version
of the app can be viewed at [http://localhost:3000/index.html](http://localhost:3000/index.html)

# Docker

You can also serve the app up through the docker-compose file that exists in the 
repository.

`docker compose up frontend`

The Docker compose version can be viewed at: 
[http://localhost:3005/index.html](http://localhost:3005/index.html)

# Deployments

If you push your branch and trigger a 
