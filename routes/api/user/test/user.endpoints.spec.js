'use strict';

const chakram = require('chakram');
let expect = chakram.expect;

let user = {
    "firstName": "Mohammed",
    "lastName": "Lazhari",
    "email": "test789@test.com",
    "password": "qwerty"
};
describe('User End Points', function() {
    describe('Get /api/users endpoint', function() {
        it("should GET 404 for GET /api/users", function() {
            var response = chakram.get("http://localhost:9000/api/users");
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Post /api/users endpoint', function() {
        it("should return 400 as response status for POST /api/users", function() {
            var response = chakram.post("http://localhost:9000/api/users");
            expect(response).to.have.status(400);
            expect(response).not.to.be.encoded.with.gzip;
            expect(response).to.have.header("content-type", "application/json; charset=utf-8");
            expect(response).to.comprise.of.json(
                [
                    "\"firstName\" is required",
                    "\"lastName\" is required",
                    "\"email\" is required",
                    "\"password\" is required"
                ]
            );
            return chakram.wait();
        });
        it("should Post 201 as response status for POST /api/users", function() {
            var response = chakram.post("http://localhost:9000/api/users", user);
            expect(response).to.have.status(201);
            expect(response).not.to.be.encoded.with.gzip;
            expect(response).to.have.header("content-type", "application/json; charset=utf-8");
            expect(response).to.comprise.of.json({
                "message": "check your mail for activation"
            });
            return chakram.wait();
        });
        it("should Post 500 as response status for duplicated user mail for POST /api/users", function() {
            var response = chakram.post("http://localhost:9000/api/users", user);
            expect(response).to.have.status(500);
            expect(response).not.to.be.encoded.with.gzip;
            expect(response).to.have.header("content-type", "application/json; charset=utf-8");
            expect(response).to.comprise.of.json({
                "message": "User validation failed",
                "name": "ValidationError",
                "errors": {
                    "email": {
                        "message": "The specified email address is already in use.",
                        "name": "ValidatorError",
                        "properties": {
                            "type": "user defined",
                            "message": "The specified email address is already in use.",
                            "path": "email",
                            "value": "test789@test.com"
                        },
                        "kind": "user defined",
                        "path": "email",
                        "value": "test789@test.com"
                    }
                }
            });
            return chakram.wait();
        });
    });
});
