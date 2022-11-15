// const mongoose = require('mongoose')
// const request = require('supertest')
// const app = require('../src/app')
// const Product = require('../src/models/product.model')
// const User = require('../src/models/user.model')
// const { adminUser, dummyProduct, initializeDatabase } = require('./fixtures/db')

// //Disconnect from database when finished
// afterAll(async () => {
//     await mongoose.disconnect();
// });

// //Products testing
// describe('Products Tests', () => {

//     beforeEach(async () => {
//         await initializeDatabase();
//     });

//     test('should not insert a new product if unauthorized', async () => {
//         await request(app).post('/products')
//             .send({
//                 name: "Demo Product",
//                 description: "This is a demo description"
//             }).expect(401)
//     });

//     test('should not insert a new product if bad user entry', async () => {

//         //name, required is missing
//         await request(app).post('/products')
//             .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
//             .send({
//                 description: "This is a demo description"
//             }).expect(400)

//         //name, required is undefined
//         await request(app).post('/products')
//             .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
//             .send({
//                 name: undefined,
//                 description: "This is a demo description"
//             }).expect(400)

//         //name, required is empty string
//         await request(app).post('/products')
//             .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
//             .send({
//                 name: "",
//                 description: "This is a demo description"
//             }).expect(400)

//     });

//     test('should insert a new product', async () => {
//         const responseInsert = await request(app).post('/products')
//             .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
//             .send({
//                 name: "Demo Product",
//                 description: "This is a demo description"
//             }).expect(201)

//         const product = await Product.findById(responseInsert.body.product._id)
//         expect(product).not.toBeNull();
//     });

//     test('should not delete if unauthorized', async () => {
//         await request(app).delete('/products/' + dummyProduct._id)
//             .send()
//             .expect(401)
//     })

//     test('should delete an existing product', async () => {
//         await request(app).delete('/products/' + dummyProduct._id)
//             .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
//             .send()
//             .expect(200)
//     })
// })

// //Auth and Users testing
// describe('Auth and Users Tests', () => {
//     beforeEach(async () => {
//         await initializeDatabase();
//     });

//     test('should create a new user', async () => {
//         const newUserData = {
//             email: "demouser@email.com",
//             password: "checkThisPassword"
//         }
//         const response = await request(app).post('/users').send({
//             email: newUserData.email,
//             password: newUserData.password
//         }).expect(201)

//         const user = await User.findById(response.body.user._id);
//         expect(user).not.toBeNull();
//         expect(user.password).not.toBe(newUserData.password)
//     })

//     test('Should login existing user', async () => {
//         const response = await request(app).post('/users/login').send({
//             email: adminUser.email,
//             password: adminUser.password
//         }).expect(200)
//         const user = await User.findById(adminUser._id)
//         expect(response.body.token).toBe(user.tokens[1].token)
//     })

//     test('Should not login nonexistent user', async () => {
//         await request(app).post('/users/login').send({
//             email: adminUser.email,
//             password: 'badpassword'
//         }).expect(401)
//     })
// })

