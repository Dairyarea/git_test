FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build:shared
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --schema=packages/api/src/prisma/schema.prisma && npx tsx packages/api/src/server.ts"]
