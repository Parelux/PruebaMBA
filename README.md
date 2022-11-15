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
- Los tests se podrían ampliar más hasta alcanzar el code coverage máximo.
- Creo que he hecho demasiado con la autorización, pero necesitaba refrescar.
- En este caso al ser búsquedas sencillas, no habría que revisar la eficiencia de las querys.
- Los middleware de validación faltarían.
- Un frontend.
# Test realizados
Products Tests
- should not insert a new product if unauthorized (184 ms)
- should not insert a new product if bad user entry (65 ms)
- should insert a new product (41 ms)
- should not delete if unauthorized (44 ms)
- should delete an existing product (40 ms)

Auth and Users TestsMuy
- should create a new user (77 ms)
- Should login existing user (75 ms)
- Should not login nonexistent user (63 ms)