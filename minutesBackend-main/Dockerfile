FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Update and install dependencies
RUN apt-get update && apt-get install -y software-properties-common

# install nodejs
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs

# install ffmpeg
RUN add-apt-repository ppa:ubuntuhandbook1/ffmpeg7 \
  && apt-get update \
  && apt-get install ffmpeg -y


WORKDIR /app 
COPY package*.json ./ 
RUN npm install 
COPY . . 
EXPOSE 4000
CMD ["node", "server.js"]
