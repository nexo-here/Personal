# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port if needed (optional, for web hooks or express)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
