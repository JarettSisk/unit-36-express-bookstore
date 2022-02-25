const request = require('supertest');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = "test"

let testBook;
// Run before each test
beforeEach(async () => {

    testBook = {
        "isbn": "0691161519",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "test",
        "language": "english",
        "pages": 999,
        "publisher": "test",
        "title": "test",
        "year": 2017
    };

    const result = await db.query(
        `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
      [
        testBook.isbn,
        testBook.amazon_url,
        testBook.author,
        testBook.language,
        testBook.pages,
        testBook.publisher,
        testBook.title,
        testBook.year
      ]
    );
    testBook = result.rows[0];
  })
  
  // Run after each test
  afterEach(async () => {
    await db.query(`DELETE FROM books`)
  })
  
  // Run after all tests are finished
  afterAll(async () => {
    await db.end()
  })


describe("Test book routes", function () {

    test("Can create a single book", async () => {

        let newBook = {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "derp",
            "language": "english",
            "pages": 264,
            "publisher": "guh",
            "title": "abcd",
            "year": 2017
        };

        const res = await request(app).post("/books").send(newBook) // send the request and await the response
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({book : newBook});
    })

    test("Can update a single book", async () => {
        let updatedCreds = {
            "amazon_url": "http://a.co/eobPtX2",
            "author": "derp",
            "language": "english",
            "pages": 264,
            "publisher": "guh",
            "title": "abcd",
            "year": 2017
        };

        const res = await request(app).put("/books/0691161519").send(updatedCreds) // send the request and await the response
        const res2 = await request(app).get("/books/0691161519");
        testBook = res2.body.book;
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book : testBook});
    })

    test("Can get single book", async () => {
        const res = await request(app).get("/books/0691161519");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book : testBook});
    })

    test("Can get all books", async () => {
        const res = await request(app).get("/books/");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books : [testBook]});
    })

});

