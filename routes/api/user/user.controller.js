'use strict';

const cloudinary = require('cloudinary');
const path = require('path');
const moment = require('moment');

const config = require('../../../config');
const User = require('../../../models/user');
const mailAuth = require('../../core/mailing-service').mailAuth;
const Accounts = require('./lib/account-utility');
const validationError = function(res, err) {
    return res.json(422, err);
};

cloudinary.config(config.cloudinary);

/**
 * @api {get} /api/users Get the list of users
 * @apiVersion 0.1.0
 * @apiPermission Admin
 * @apiName ListUsers
 * @apiGroup User
 * @apiSuccess {Array} users The user array.
 * @apiError UsersNotFound The Users was not found.
 * @apiHeader {String} Authorization The user token.
 * @apiSampleRequest http://localhost:9090/api/users
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *        "_id": "565a4e1fcb9a4ec03ee975e5",
 *        "provider": "local",
 *        "email": "ciblos19@hotmail.fr",
 *        "__v": 0,
 *        "firstName": "Lazhari",
 *        "lastName": "Mohammed",
 *        "created": null,
 *        "updated": "2015-12-02T21:31:11.748Z",
 *        "deleted": false,
 *        "phones": [],
 *        "active": true,
 *        "role": "user"
 *    }, ....]
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsersNotFound"
 *     }
 */
exports.index = function(req, res) {
    var query = {
        $or: [{
            deleted: false
        }, {
            deleted: {
                $exists: false
            }
        }]
    };

    User.find(query, '-salt -hashedPassword', function(err, users) {
        if (err) return res.send({
            error: "UserNotFound"
        }, 404);
        res.send(users, 200);
    });
};

/**
 * @api {post} /api/users Create a new user
 * @apiVersion 0.1.0
 * @apiPermission none
 * @apiName CreateUser
 * @apiGroup User
 * @apiParam {String} fullName the user pseudo.
 * @apiParam {String} email the user mail.
 * @apiParam {String} password the user password (min 6 characters).
 * @apiSuccess {Object} response The success message.
 * @apiError ValidationErrors The user fields invalid.
 * @apiError CreationError The user creation failed.
 * @apiSampleRequest http://localhost:9090/api/users
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     { message: "check your mail for activation" }
 * @apiErrorExample ValidationErrors:
 *     HTTP/1.1 400 InvalidParams
 *[
 *  {
 *    "param": "fullName",
 *    "msg": "The fullName user field is required"
 *  },
 *  {
 *    "param": "email",
 *    "msg": "The email field is invalid"
 *  },
 *  {
 *    "param": "password",
 *    "msg": "The paasword is invalid"
 *  }
 *]
 */
exports.create = function(req, res, next) {
    let user = new User(req.body);
    user.provider = 'local';
    user.role = 'user';
    //Create user and save token
    user.save(function(err, user) {
        if (err) return res.status(500).send(err);
        //Create Token
        Accounts.createToken(user._id, 3, function(err, token) {
            if (err) return res.send(err, 500);
            moment.locale('fr');
            var data = {
                user: user,
                token: token,
                mailDate: moment().format("Do MMMM YYYY")
            };
            mailAuth.mailSignin(user.email, data, function(err, info) {
                if (err) return res.status(500).send(err);
                res.status(201).send({
                    message: "check your mail for activation"
                });
            });
        });
    });
};

/**
 * @api {get} /api/users/:id Get user by ID
 * @apiVersion 0.1.0
 * @apiPermission admin, owner
 * @apiName GetUserById
 * @apiGroup User
 * @apiParam {ObjectId} id The user id.
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {json} userObject The user Object.
 * @apiError InvalidId The user id invalid.
 * @apiError UserNotFound The User was not found.
 * @apiSampleRequest http://localhost:9090/api/users/565a4e1fcb9a4ec03ee975e5
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *    {
 *        "_id": "566301cc095ce6df0f415a5b",
 *        "email": "gerhard.paucek@yahoo.com",
 *        "paypalAccount": "Christa_Gerlach@gmail.com",
 *        "avatarPictureUrl": "https://s3.amazonaws.com/uifaces/faces/twitter/shanehudson/128.jpg",
 *        "firstName": "Johan",
 *        "gender": "Homme",
 *        "lastName": "Frederic",
 *        "phone": "482-563-3703",
 *        "fullName": "Ona.Bergstrom67",
 *        "__v": 0,
 *        "updated": "2015-12-05T15:25:00.227Z",
 *        "phones": [],
 *        "address": {
 *            "city": "Mohr burgh",
 *            "country": "Guinea-Bissau",
 *            "address1": "5249 Gaylord Loop",
 *            "address2": "Apt. 864"
 *        },
 *        "active": false,
 *        "role": "user"
 *    }
 * @apiErrorExample InvalidId:
 *     HTTP/1.1 400 InvalidParams
 *    {
 *      "param": "id",
 *      "msg": "The user id is invalid",
 *      "value": "565a4e1fcb9fa4ec03ee975e5"
 *    }
 * @apiErrorExample UserNotFound:
 *     HTTP/1.1 404 Not Found
 *    {
 *       "message": "User not found!"
 *    }
 */
exports.show = function(req, res, next) {
    // checkBody only checks req.body; none of the other req parameters
    req.checkParams('id', 'The user id is invalid').isMongoId();

    var errors = req.validationErrors();
    if (errors) {
        return res.send(errors, 400);
    } else {
        var userId = req.params.id;

        User.findById(userId).select('-salt -hashedPassword -deleted -created').exec(function(err, user) {
            if (err) return res.send({
                message: "User not found"
            }, 404);
            if (!user) return res.send({
                message: "User not found!"
            }, 404);
            res.json(user);
        });
    }
};

/**
 * @api {delete} /api/users/:id Delete user by id
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiName DeleteUserId
 * @apiGroup User
 * @apiParam {ObjectId} id The user id.
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {json} userObject The user Object.
 * @apiError InvalidId The user id invalid.
 * @apiError UserNotFound The User was not found.
 * @apiSampleRequest http://localhost:9090/api/users/565a4e1fcb9a4ec03ee975e5
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 202 Accepted
 *     {_id: "565a4e1fcb9a4ec03ee975e5", message:"The user has been deleted successfully!"}
 * @apiErrorExample InvalidId:
 *     HTTP/1.1 400 InvalidParams
 *    {
 *      "param": "id",
 *      "msg": "The user id is invalid",
 *      "value": "565a4e1fcb9fa4ec03ee975e5"
 *    }
 * @apiErrorExample UserNotFound:
 *     HTTP/1.1 4004 Not Found
 *    {
 *       "message": "User not found!"
 *    }
 */
exports.destroy = function(req, res) {
    var userId = req.params.id;

    User.findById(userId, function(err, user) {
        if (err) return res.send({
            message: "user not found!"
        }, 404);
        if (!user) return res.send({
            message: "user not found!"
        }, 404);
        user.deleted = true;
        user.save(function(err, id) {
            if (err) return res.send(err, 500);
            return res.send({
                _id: user._id,
                message: "The user has been deleted successfully!"
            }, 202);
        });
    });
};

/**
 * @api {put} /api/users/:id/password Change the user password
 * @apiVersion 0.1.0
 * @apiPermission owner
 * @apiName ChangeUserPassword
 * @apiGroup User
 * @apiParam {ObjectId} id The user id.
 * @apiParam {String} current-password The current password (min 6 characters).
 * @apiParam {String} new-password The new password.
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {json} SucceessObject The success object.
 * @apiError InvalidParams The invalid params.
 * @apiError UserNotFound The User was not found.
 * @apiError Unauthorized The anauthorized access.
 * @apiError InvalidPassword The current password is wrong.
 * @apiSampleRequest http://localhost:9090/api/users/565a4e1fcb9a4ec03ee975e5/password
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {_id: "565a4e1fcb9a4ec03ee975e5", message:"The user has been deleted successfully!"}
 * @apiErrorExample InvalidParams:
 *     HTTP/1.1 400 InvalidParams
 *    [
 *        {
 *            "param": "current-password",
 *            "msg": "The current password is invalid",
 *            "value": ""
 *        },
 *        {
 *            "param": "new-password",
 *            "msg": "The new password is invalid",
 *            "value": ""
 *        }
 *    ]
 * @apiErrorExample Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *    {
 *        "name": "UnauthorizedError",
 *        "message": "No authorization token was found",
 *        "code": "credentials_required",
 *        "status": 401,
 *        "inner": {
 *            "message": "No authorization token was found"
 *        }
 *    }
 * @apiErrorExample InvalidPassword:
 *    {
 *        "message": "The current password is wrong!"
 *    }
 */
exports.changePassword = function(req, res, next) {
    req.checkBody('current-password', 'The current password is invalid').isLength(6, 16);
    req.checkBody('new-password', 'The new password is invalid').isLength(6, 16);

    var errors = req.validationErrors();
    if (errors) {
        return res.send(errors, 400);
    } else {
        if (req.user && req.user._id) {
            var userId = req.user._id;
            var oldPass = String(req.body['current-password']);
            var newPass = String(req.body['new-password']);
            User.findById(userId, function(err, user) {
                if (user.authenticate(oldPass)) {
                    user.password = newPass;
                    user.save(function(err) {
                        if (err) return (err, 500);
                        res.send(200, {
                            message: "The password has been successfully changed!"
                        });
                    });
                } else {
                    res.send(403, {
                        message: "The current password is wrong!"
                    });
                }
            });
        } else {
            return res.send({
                message: "	Action requires a user authentication."
            }, 401);
        }
    }
};

/**
 * @api {put} /api/users/:id/profile Update profile informations
 * @apiName UpdateProfile
 * @apiGroup User
 *
 * @apiParam {ObjectId} id Users unique ID.
 *
 * @apiSuccess {String} message the success message or the error message.
 */

/**
 * @api {put} /api/users/:id/profile Update user profile
 * @apiVersion 0.1.0
 * @apiPermission owner
 * @apiName UpdateProfile
 * @apiGroup User
 * @apiParam {ObjectId} id The user id.
 * @apiParam {String} [firstname]      Optional Firstname of the User.
 * @apiParam {String} [lastname]       Optional Lastname of the User.
 * @apiParam {String} [phone]     Optional The user phone.
 * @apiParam {String} [paypalAccount]     Optional The paypal account.
 * @apiParam {String} [RIB]     Optional The user RIB.
 * @apiParam {String} [cinScan]     Optional The user CIN url picture scan.
 * @apiParam {String} [avatarPictureUrl]     Optional The user picture url.
 * @apiParam {string="Homme","Femme"} [gender]     Optional Gender of the User.
 * @apiParam {String} [address.city] Optional The user address city.
 * @apiParam {String} [address.country='FR'] Optional The user address country.
 * @apiParam {String} [address.address1] Optional The user street address.
 * @apiParam {String} [address.address2] Optional The user address.
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {json} userObject The user Object.
 * @apiError UserNotFound The User was not found.
 * @apiError Unauthorized The anauthorized access.
 * @apiSampleRequest http://localhost:9090/api/users/565a4e1fcb9a4ec03ee975e5/profile
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {_id: "565a4e1fcb9a4ec03ee975e5", message:"The user has been deleted successfully!"}
 * @apiErrorExample Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *    {
 *        "name": "UnauthorizedError",
 *        "message": "No authorization token was found",
 *        "code": "credentials_required",
 *        "status": 401,
 *        "inner": {
 *            "message": "No authorization token was found"
 *        }
 *    }
 */
exports.updateProfile = (req, res, next) => {
    // req.checkBody('firstName', 'The first name is invalid').notEmpty();
    // req.checkBody('lastName', 'The last name is invalid').notEmpty();
    var userId = req.user._id;
    User.findById(userId, (err, user) =>{
        if (err) return res.send(err, 500);
        if (!user) return res.send({
            message: "The user not found"
        }, 401);
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.address = req.body.address || user.address;
        user.phones = req.body.phones || user.phones;
        user.phone = req.body.phone || user.phone;
        user.gender = req.body.gender || user.gender;
        user.avatarPictureUrl = req.body.avatarPictureUrl || user.avatarPictureUrl;
        user.save(err => {
            if (err) return res.send(err, 500);
            user = user.toObject();
            delete user.hashedPassword;
            delete user.salt;
            return res.send(200, user);
        });
    });
};

/**
 * @api {get} /api/users/me Get the current authenticated user profile
 * @apiVersion 0.1.0
 * @apiPermission owner
 * @apiName CurrentUser
 * @apiGroup User
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {json} userObject The user profile.
 * @apiError UserNotFound The User was not found.
 * @apiError Unauthorized The anauthorized access.
 * @apiSampleRequest http://localhost:9090/api/users/me
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *        "_id": "565a4e1fcb9a4ec03ee975e5",
 *        "provider": "local",
 *        "fullName": "Simo",
 *        "email": "ciblos19@hotmail.fr",
 *        "__v": 0,
 *        "firstName": "Lazhari",
 *        "lastName": "Mohammed",
 *        "created": null,
 *        "updated": "2015-12-02T21:31:11.748Z",
 *        "deleted": false,
 *        "phones": [],
 *        "active": true,
 *        "role": "user"
 *    }
 * @apiErrorExample Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *    {
 *        "name": "UnauthorizedError",
 *        "message": "No authorization token was found",
 *        "code": "credentials_required",
 *        "status": 401,
 *        "inner": {
 *            "message": "No authorization token was found"
 *        }
 *    }
 * @apiErrorExample UserNotFound:
 *     HTTP/1.1 404 Not Found
 *    {message: "This user is not founded!"}
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return res.send(err, 500);
        if (!user) return res.send({
            message: "This user is not founded!"
        }, 404);
        return res.send(user, 200);
    });
};
/**
 * @api {post} /api/users/:id/upload-avatar Upload avatar
 * @apiVersion 0.1.0
 * @apiPermission owner
 * @apiName UploadAvatar
 * @apiGroup User
 * @apiParam {ObjectId} id The user id.
 * @apiParam {File} file The avatar local file.
 * @apiHeader {String} Authorization The user token.
 * @apiHeaderExample {String} Header-Example:
 * "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVhNGUxZmNiOWE0ZWMwM2VlOTc1ZTUiLCJpYXQiOjE0NDkzNTQzNjAsImV4cCI6MTQ0OTM3MjM2MH0.qXpTSzgVPsrghuvhGo147CDaHRPa0IGlTFF2nyGR7wY"
 * @apiSuccess {Object} message The success message.
 * @apiSuccess {Object} picture The user picture.
 * @apiError Unauthorized The anauthorized access.
 * @apiError ErrorServer The server error.
 * @apiError UserNotFound the user not found
 * @apiSampleRequest http://localhost:9090/api/users/565a4e1fcb9a4ec03ee975e5/upload-avatar
 * @apiSuccessExample SuccessResponse:
 *     HTTP/1.1 200 OK
 *    {
 *        "message": "Your picture has beed successfully save!",
 *        "picture": "/uploads/724b7ae4c66e207c594f6386a4e52468.png"
 *    }
 * @apiErrorExample Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *    {
 *        "name": "UnauthorizedError",
 *        "message": "No authorization token was found",
 *        "code": "credentials_required",
 *        "status": 401,
 *        "inner": {
 *            "message": "No authorization token was found"
 *        }
 *    }
 * @apiErrorExample ErrorServer:
 *     HTTP/1.1 500
 *    {message: "Sorry something wrong! We can not update your picture now!"}
 * @apiErrorExample UserNotFound:
 *     HTTP/1.1 404 Not Found
 *    {message: "UserNotFound"}
 */
exports.uploadPicture = function(req, res, next) {
    cloudinary.uploader.upload(req.files.avatar.path, function(result) {
        return res.send(result);
    });
};
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
