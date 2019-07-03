const mongoose = require("mongoose");
const request = require("supertest");
const expect = require("chai").expect;
const { Category } = require("../../../backend/models/Category");
let server;

describe("/api/categories", () => {

    before(done => {
        server = require("../../../server");
        mongoose.connection.on("open", done);
    });

    beforeEach(async () => {
        await Category.deleteMany({});
        const category = new Category({ name: "category_1"});
        await category.save();
    });

    afterEach(async () => {
        await Category.deleteMany({});
    });

    after(async () => {
        await Category.deleteMany({});
        server && server.close();
    });

    describe("GET / ", () => {
        it("should return all categories", async () => {
            const res = await request(server).get("/api/categories");
            expect(res.status).to.be.equal(200);
            expect(res.body.length).to.be.at.least(1);
        })
    })

    describe("POST /", () => {
        it("should save and return a category", async () => {
            const res = await request(server)
                .post("/api/categories")
                .send({ name: "category_post" });

            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property("name", "category_post");
        })
    })
})