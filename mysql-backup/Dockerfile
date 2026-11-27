
FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends default-mysql-client gzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY backup.js ./

CMD ["npm", "run", "backup"]
