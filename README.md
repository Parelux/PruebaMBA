# Requisitos de sistema
- (Opcional) Docker Engine
- (Opcional) docker-compose 
- npm 
- node.js
# Pasos para arrancar
- Instalar las dependencias necesarias para la ejecución:
    - npm install

- Si hay base de datos mongo, configurar su URL en los dos entornos, dev y test
dentro de la carpeta "/config"

- Si no hay base de datos preparada, este comando lanza una en un container
    - docker-compose -f docker-compose.yaml up -d

- Arrancar la aplicación:
    - npm run dev

- Pasar los tests:
    - npm run test

- Para probar la aplicación utilizar la colección postman en la carpeta llamada Postman.
# TODO List

# Test realizados
